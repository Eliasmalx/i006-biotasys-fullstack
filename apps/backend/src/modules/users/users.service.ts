import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, LessThan } from 'typeorm';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from './entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LaboratoryOptionDto } from './dto/laboratory-option.dto';
import { EmailService } from '../../infrastructure/email/services/email.service';
import config from '../../config/dotenv.config';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly VERIFICATION_TOKEN_EXPIRY_MINUTES = 15;
  private readonly VERIFICATION_TOKEN_LENGTH = 32;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea un nuevo usuario con contraseña hasheada y envía email de verificación
   * @param createUserDto Datos para crear el usuario
   * @returns UserResponseDto sin exponer la contraseña
   * @throws ConflictException si el email ya existe
   * @throws BadRequestException si hay error en la validación
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `El usuario con el correo ${createUserDto.email} ya existe`,
        );
      }

      // Hash de la contraseña
      const hashedPassword: string = await bcrypt.hash(
        createUserDto.password,
        10,
      );

      // Crear la entidad del usuario (no verificado por defecto)
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        emailVerified: false,
      });

      // Guardar en la base de datos
      const savedUser = await this.userRepository.save(user);

      // Generar token de verificación
      const verificationToken = await this.generateVerificationToken(
        savedUser.id,
      );

      // Construir URL de verificación
      const appUrl = process.env.APP_URL || 'http://localhost:3001';
      const verificationLink = `${appUrl}/auth/verify-email?token=${verificationToken.token}`;

      // Enviar email de verificación
      await this.emailService.sendEmailVerificationEmail(
        savedUser.email,
        savedUser.firstName,
        verificationLink,
        this.VERIFICATION_TOKEN_EXPIRY_MINUTES,
      );

      // Retornar DTO sin exponer la contraseña
      const responseDto = this.mapUserToResponseDto(savedUser);
      if (config.nodeEnv === 'development') {
        responseDto.verificationToken = verificationToken.token;
        responseDto.verificationLink = verificationLink;
      }
      return responseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log para debugging
      console.error('Error creating user:', error);

      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.mapUserToResponseDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapUserToResponseDto(user);
  }

  async listLaboratoryOptions(
    search?: string,
    currentUser?: { userId: string; role: Role },
  ): Promise<LaboratoryOptionDto[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.emailVerified = :emailVerified', { emailVerified: true })
      .andWhere('user.laboratory IS NOT NULL')
      .andWhere("TRIM(user.laboratory) <> ''");

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets((subQb) => {
          subQb
            .where('user.laboratory ILIKE :term', { term })
            .orWhere('user.firstName ILIKE :term', { term })
            .orWhere('user.lastName ILIKE :term', { term })
            .orWhere('user.email ILIKE :term', { term });
        }),
      );
    }

    if (currentUser?.role === Role.LABORATORIO) {
      const actor = await this.userRepository.findOne({
        where: { id: currentUser.userId },
      });
      const actorLaboratory = this.normalizeLaboratory(actor?.laboratory);
      if (!actorLaboratory) {
        return [];
      }

      qb.andWhere('LOWER(TRIM(user.laboratory)) = :actorLaboratory', {
        actorLaboratory,
      });
    }

    qb.orderBy('user.laboratory', 'ASC')
      .addOrderBy('user.firstName', 'ASC')
      .addOrderBy('user.lastName', 'ASC');

    const users = await qb.getMany();

    return users.map((user) => ({
      userId: user.id,
      laboratory: user.laboratory!.trim(),
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
    }));
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario (UUID)
   * @param updateUserDto Datos a actualizar
   * @returns UserResponseDto actualizado
   * @throws NotFoundException si el usuario no existe
   * @throws ConflictException si el email ya está en uso
   * @throws BadRequestException si hay error en la validación
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      // Buscar el usuario por ID
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      // Guardar email original para comparar si cambió
      const originalEmail = user.email;
      let emailChanged = false;

      // Validar si el email cambió y ya existe
      if (updateUserDto.email && updateUserDto.email !== originalEmail) {
        const existingUserWithEmail = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUserWithEmail) {
          throw new ConflictException(
            `El correo ${updateUserDto.email} ya está en uso`,
          );
        }

        emailChanged = true;
      }

      // Actualizar campos permitidos
      if (updateUserDto.firstName) {
        user.firstName = updateUserDto.firstName;
      }

      if (updateUserDto.lastName) {
        user.lastName = updateUserDto.lastName;
      }

      if (updateUserDto.laboratory !== undefined) {
        user.laboratory = updateUserDto.laboratory || null;
      }

      if (updateUserDto.email) {
        user.email = updateUserDto.email;
        // Si cambia el email, marcar como no verificado
        user.emailVerified = false;
      }

      // Hash de la nueva contraseña si se proporciona
      if (updateUserDto.password) {
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Guardar cambios
      const updatedUser = await this.userRepository.save(user);

      // Si el email cambió, enviar nuevo email de verificación
      if (emailChanged) {
        const verificationToken = await this.generateVerificationToken(
          updatedUser.id,
        );
        const appUrl = process.env.APP_URL || 'http://localhost:3001';
        const verificationLink = `${appUrl}/auth/verify-email?token=${verificationToken.token}`;

        await this.emailService.sendEmailVerificationEmail(
          updatedUser.email,
          updatedUser.firstName,
          verificationLink,
          this.VERIFICATION_TOKEN_EXPIRY_MINUTES,
        );
      }

      return this.mapUserToResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error updating user:', error);
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.userRepository.remove(user);
    this.logger.log(`Usuario ${user.email} eliminado`);

    return { message: `Usuario eliminado exitosamente` };
  }

  /**
   * Genera un token de verificación de email
   * @param userId ID del usuario
   * @returns Token de verificación
   */
  private async generateVerificationToken(
    userId: string,
  ): Promise<EmailVerificationToken> {
    // Ejecutar limpiezas de tokens expirados
    await this.emailVerificationTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Generar token aleatorio
    const tokenString = randomBytes(this.VERIFICATION_TOKEN_LENGTH)
      .toString('hex')
      .toUpperCase();

    // Calcular fecha de expiración
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + this.VERIFICATION_TOKEN_EXPIRY_MINUTES,
    );

    // Crear y guardar el token
    const token = this.emailVerificationTokenRepository.create({
      userId,
      token: tokenString,
      expiresAt,
    });

    return this.emailVerificationTokenRepository.save(token);
  }

  /**
   * Verifica el email del usuario usando el token
   * @param token Token de verificación
   * @throws NotFoundException si el token no existe o expiró
   * @throws BadRequestException si ya estaba verificado
   */
  async verifyEmail(token: string): Promise<UserResponseDto> {
    try {
      // Buscar el token válido (no expirado)
      const verificationToken =
        await this.emailVerificationTokenRepository.findOne({
          where: {
            token,
          },
          relations: ['user'],
        });

      if (!verificationToken || verificationToken.expiresAt < new Date()) {
        throw new NotFoundException(
          'Token de verificación inválido o expirado',
        );
      }

      const user = verificationToken.user;

      // Verificar si ya estaba verificado
      if (user.emailVerified) {
        throw new BadRequestException('El email ya fue verificado');
      }

      // Marcar como verificado
      user.emailVerified = true;
      const updatedUser = await this.userRepository.save(user);

      // Eliminar el token usado
      await this.emailVerificationTokenRepository.remove(verificationToken);

      return this.mapUserToResponseDto(updatedUser);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Error verifying email:', error);
      throw new BadRequestException('Error al verificar el email');
    }
  }

  /**
   * Mapea una entidad User a UserResponseDto
   */
  private mapUserToResponseDto(user: User): UserResponseDto {
    const responseDto = new UserResponseDto();
    responseDto.id = user.id;
    responseDto.email = user.email;
    responseDto.firstName = user.firstName;
    responseDto.lastName = user.lastName;
    responseDto.laboratory = user.laboratory ?? null;
    responseDto.role = user.role;
    responseDto.isActive = user.isActive;
    responseDto.emailVerified = user.emailVerified;
    responseDto.lastLoginAt = user.lastLoginAt;
    responseDto.createdAt = user.createdAt;
    responseDto.updatedAt = user.updatedAt;
    return responseDto;
  }

  private normalizeLaboratory(value?: string | null): string | null {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }
}
