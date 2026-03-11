/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Role } from '../../common/enums/role.enum';
import config from '../../config/dotenv.config';
import { EmailService } from '../../infrastructure/email/services/email.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Servicio de autenticación
 * Responsabilidades:
 * - Login con email y contraseña
 * - Generación de JWT y Refresh tokens
 * - Validación de credenciales y email verificado
 * - Refresco de access tokens
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;
  private readonly PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Login con email y contraseña
   * @param loginDto Email, contraseña y rol seleccionado
   * @returns AccessToken, RefreshToken y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   * @throws BadRequestException si el email no está verificado
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password, role } = loginDto;

    // Buscar usuario por email (case-insensitive)
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Validar que el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException(
        'El usuario no está activo. Contacta con el administrador',
      );
    }

    // Validar que el email está verificado
    if (!user.emailVerified) {
      throw new BadRequestException(
        'Tu email aún no ha sido verificado. Revisa tu bandeja de entrada para el enlace de verificación',
      );
    }

    // Actualizar último login
    const now = new Date();
    await this.userRepository.update(user.id, { lastLoginAt: now });

    // Generar access token con el role del login y refresh token
    const accessToken = this.generateAccessToken(user, role);
    const refreshToken = await this.generateRefreshToken(user.id, role);

    this.logger.log(
      `Usuario ${user.email} inició sesión con rol ${role} exitosamente`,
    );

    return this.buildLoginResponse(user, role, accessToken, refreshToken.token);
  }

  /**
   * Cambia el rol de la sesion activa sin modificar el rol persistido en BD
   * @param userId ID del usuario autenticado
   * @param targetRole Rol objetivo para emitir nuevos tokens
   * @returns Nuevos tokens y datos de usuario con el rol de sesion solicitado
   */
  async switchSessionRole(
    userId: string,
    targetRole: Role,
  ): Promise<LoginResponseDto> {
    if (!this.SWITCHABLE_ROLES.includes(targetRole)) {
      throw new BadRequestException(
        'Solo se permite cambiar entre nutricionista y laboratorio',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'El usuario no esta activo. Contacta con el administrador',
      );
    }

    if (!user.emailVerified) {
      throw new BadRequestException(
        'Tu email aun no ha sido verificado. Revisa tu bandeja de entrada para el enlace de verificacion',
      );
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const accessToken = this.generateAccessToken(user, targetRole);
    const refreshToken = await this.generateRefreshToken(user.id, targetRole);

    this.logger.log(
      `Usuario ${user.email} cambio sesion a rol ${targetRole} exitosamente`,
    );

    return this.buildLoginResponse(
      user,
      targetRole,
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: config.jwtExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Genera un access token JWT con el rol seleccionado
   * @param user Entidad del usuario
   * @param role Rol seleccionado en el login
   * @returns Token JWT
   */
  private generateAccessToken(user: User, role: Role): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Genera un refresh token y lo guarda en la BD
   * @param userId ID del usuario
   * @param role Rol seleccionado en el login
   * @returns RefreshToken entity
   */
  private async generateRefreshToken(
    userId: string,
    role: Role,
  ): Promise<RefreshToken> {
    // Generar token aleatorio
    const tokenString = randomBytes(32).toString('hex').toUpperCase();

    // Hash del token para almacenar en BD (no almacenar el token en texto plano)
    const tokenHash = await bcrypt.hash(tokenString, 10);

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    // Crear y guardar el token
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token: tokenString,
      tokenHash,
      role,
      expiresAt,
      isRevoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  /**
   * Refresca el access token usando un refresh token válido
   * @param refreshTokenDto Contiene el refresh token
   * @returns Nuevo access token
   * @throws UnauthorizedException si el token es inválido o expiró
   * @throws BadRequestException si el token fue revocado
   */
  async refreshAccessToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Buscar el refresh token en BD
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['user'],
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Validar que no esté revocado
      if (storedToken.isRevoked) {
        throw new BadRequestException(
          'Refresh token ha sido revocado. Por favor, vuelve a loguear',
        );
      }

      // Validar que no esté expirado
      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Validar que el usuario existe y está activo
      const user = storedToken.user;
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario inactivo o no encontrado');
      }

      // Generar nuevo access token con el mismo rol del refresh token
      const newAccessToken = this.generateAccessToken(user, storedToken.role);

      this.logger.log(`Access token refrescado para usuario ${user.email}`);

      return {
        accessToken: newAccessToken,
        expiresIn: config.jwtExpiresIn,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error('Error refrescando token:', error);
      throw new UnauthorizedException('Error al refrescar el token');
    }
  }

  /**
   * Revoca un refresh token (logout)
   * @param refreshToken Token a revocar
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      const token = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
      });

      if (token) {
        token.isRevoked = true;
        await this.refreshTokenRepository.save(token);
        this.logger.log('Refresh token revocado (logout)');
      }
    } catch (error) {
      this.logger.error('Error revocando refresh token:', error);
      // No lanzamos error, simplemente registramos
    }
  }

  /**
   * Limpia tokens expirados de la BD (operación de mantenimiento)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      this.logger.log(
        `Limpieza de tokens expirados: ${result.affected} tokens eliminados`,
      );
    } catch (error) {
      this.logger.error('Error limpiando tokens expirados:', error);
    }
  }

  /**
   * Genera un token de reseteo de contraseña y envía email
   * @param dto Contiene el email del usuario
   * @returns Mensaje de confirmación
   * @throws NotFoundException si el usuario no existe
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const { email } = dto;

      // Buscar usuario por email (case-insensitive)
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        this.logger.warn(`Intento de reset para email no existente: ${email}`);
        return {
          message:
            'Si el email existe en nuestro sistema, recibirás un enlace para restaurar tu contraseña',
        };
      }

      // Limpiar tokens previos no utilizados
      await this.passwordResetTokenRepository.delete({
        userId: user.id,
        isUsed: false,
      });

      // Generar token seguro (64 caracteres hex)
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(
        Date.now() + this.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
      );

      // Guardar token en BD
      const tokenEntity = this.passwordResetTokenRepository.create({
        userId: user.id,
        token: resetToken,
        expiresAt,
        isUsed: false,
      });

      await this.passwordResetTokenRepository.save(tokenEntity);

      // Construir link de reseteo (el frontend debe capturarlo)
      const resetLink = `${config.appUrl}/reset-password?token=${resetToken}`;

      // Enviar email
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.fullName,
        resetLink,
      );

      this.logger.log(`Email de reseteo enviado a ${user.email}`);

      return {
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace para restaurar tu contraseña',
      };
    } catch (error) {
      this.logger.error('Error en forgotPassword:', error);
      throw error;
    }
  }

  /**
   * Valida y ejecuta el reseteo de contraseña
   * @param dto Contiene el token y la nueva contraseña
   * @returns Mensaje de confirmación
   * @throws BadRequestException si el token es inválido o expirado
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const { token, newPassword } = dto;

      // Buscar el token en BD
      const resetToken = await this.passwordResetTokenRepository.findOne({
        where: { token },
        relations: ['user'],
      });

      if (!resetToken) {
        throw new BadRequestException('Token de reseteo inválido');
      }

      // Validar que no esté expirado
      if (new Date() > resetToken.expiresAt) {
        // Limpiar token expirado
        await this.passwordResetTokenRepository.remove(resetToken);
        throw new BadRequestException(
          'El enlace de reseteo ha expirado. Solicita uno nuevo',
        );
      }

      // Validar que no haya sido utilizado
      if (resetToken.isUsed) {
        throw new BadRequestException('Este token ya ha sido utilizado');
      }

      const user = resetToken.user;

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña del usuario
      user.password = hashedPassword;
      await this.userRepository.save(user);

      // Marcar token como usado
      resetToken.isUsed = true;
      await this.passwordResetTokenRepository.save(resetToken);

      this.logger.log(`Contraseña reseteada para usuario ${user.email}`);

      return {
        message:
          'Tu contraseña ha sido reseteada correctamente. Por favor, inicia sesión',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Error en resetPassword:', error);
      throw new BadRequestException(
        'Error al resetear la contraseña. Intenta de nuevo',
      );
    }
  }
}
