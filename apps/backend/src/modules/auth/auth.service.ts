/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { Invitation } from '../invitations/entities/invitation.entity';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId?: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Servicio de autenticación
 * Responsabilidades:
 * - Login con email y contraseña
 * - Validación de credenciales
 * - Generación de JWT
 * - Aceptación de invitaciones
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 10;

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  private getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  private splitFullName(fullName: string): {
    firstName: string;
    lastName: string;
  } {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    const [firstName, ...rest] = normalized.split(' ');

    return {
      firstName: firstName || 'Usuario',
      lastName: rest.join(' ') || 'Biotasys',
    };
  }

  /**
   * Login con email y contraseña
   * @param loginDto Email y contraseña
   * @returns AccessToken y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Buscar usuario por email
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

    // Actualizar último login
    const now = new Date();
    await this.userRepository.update(user.id, { lastLoginAt: now });

    // Generar JWT
    const accessToken = this.generateJWT(user);

    this.logger.log(`Usuario ${user.email} inició sesión exitosamente`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: this.getFullName(user),
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  /**
   * Genera un JWT firmado
   * @param user Entidad del usuario
   * @returns Token JWT
   */
  private generateJWT(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Valida email y contraseña (usado por Passport LocalStrategy)
   * @param email Email del usuario
   * @param password Contraseña en texto plano
   * @returns Usuario si las credenciales son válidas
   * @throws UnauthorizedException si son inválidas
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }

  /**
   * Acepta una invitación y crea el usuario
   * @param dto Token, nombre y contraseña
   * @returns Usuario creado y JWT
   * @description El token se valida contra el hash y la invitación se marca como ACCEPTED ANTES de crear el usuario para evitar race conditions
   */
  async acceptInvitation(dto: AcceptInvitationDto): Promise<LoginResponse> {
    const { token, fullName, password } = dto;

    // Validar entrada
    if (!token || !fullName || !password) {
      throw new BadRequestException(
        'Token, nombre y contraseña son requeridos',
      );
    }

    if (password.trim().length < 8) {
      throw new BadRequestException(
        'Contraseña debe tener al menos 8 caracteres',
      );
    }

    // 1. Buscar invitación pendiente con token válido
    const invitations = await this.invitationRepository.find({
      where: {
        status: InvitationStatus.PENDING,
      },
    });

    let validInvitation: Invitation | null = null;

    // Comparar token con hash y validar expiración
    for (const inv of invitations) {
      // Validar expiración primero (más rápido)
      if (new Date() > inv.expiresAt) {
        continue;
      }

      // Validar token
      const isValid = await bcrypt.compare(token, inv.tokenHash);
      if (isValid) {
        validInvitation = inv;
        break;
      }
    }

    if (!validInvitation) {
      throw new BadRequestException('Token de invitación inválido o expirado');
    }

    // 2. Marcar invitación como ACCEPTED INMEDIATAMENTE
    // Esto previene race conditions: si otro request intenta con el mismo token,
    // no encontrará una invitación PENDING
    validInvitation.status = InvitationStatus.ACCEPTED;
    validInvitation.acceptedAt = new Date();
    await this.invitationRepository.save(validInvitation);

    // 3. Validar que el email no existe
    const existingUser = await this.userRepository.findOne({
      where: { email: validInvitation.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        `El email ${validInvitation.email} ya está registrado`,
      );
    }

    // 4. Crear usuario
    const passwordHash = await bcrypt.hash(password, this.saltRounds);
    const { firstName, lastName } = this.splitFullName(fullName);

    const user = this.userRepository.create({
      email: validInvitation.email,
      password: passwordHash,
      firstName,
      lastName,
      dni: validInvitation.dni,
      // colegiadoNumber solo para PROFESSIONAL y LAB_OPERATOR (invitaciones de admin)
      // Para ADMIN, se ignora
      professionalId: validInvitation.professionalId,
      role: validInvitation.role,
      organizationId: validInvitation.organizationId,
      invitationId: validInvitation.id,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Generar JWT
    const accessToken = this.generateJWT(savedUser);

    this.logger.log(
      `Usuario ${savedUser.email} (${savedUser.role}) aceptó invitación`,
    );

    return {
      accessToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        fullName: this.getFullName(savedUser),
        role: savedUser.role,
        organizationId: savedUser.organizationId,
      },
    };
  }
}
