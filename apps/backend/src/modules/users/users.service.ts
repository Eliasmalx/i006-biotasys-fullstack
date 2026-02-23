import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Invitation } from './../invitations/entities/invitation.entity';
import { Organization } from './../organizations/entities/organization.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InvitationStatus } from './../../common/enums/invitation-status.enum';
import { UserStatus } from './../../common/enums/user-status.enum';
import { Role } from './../../common/enums/role.enum';
import { EmailService } from './../../infrastructure/email/services/email.service';
import { generateUserInvitationEmail } from './../../infrastructure/email/template';
import config from './../../config/dotenv.config';

/**
 * UsersService
 * Gestiona usuarios profesionales y operadores de laboratorio
 * (Consolidada de AdminUsersService)
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Invitar usuario profesional o operador de laboratorio
   * @param adminId ID del administrador que invita
   * @param organizationId ID de la organización
   * @param dto Email y role del usuario a invitar
   * @returns Token de invitación para enviar al usuario
   */
  async inviteUser(
    adminId: string,
    organizationId: string,
    dto: InviteUserDto,
  ): Promise<string> {
    const { email, role } = dto;
    const normalizedEmail = email.toLowerCase();

    // Validaciones
    if (!organizationId || !adminId) {
      throw new BadRequestException('organizationId y adminId son requeridos');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (role !== Role.PROFESSIONAL && role !== Role.LAB_OPERATOR) {
      throw new BadRequestException(
        'El rol debe ser professional o lab_operator',
      );
    }

    // Verificar que la organización existe
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException(
        `Organización ${organizationId} no encontrada`,
      );
    }

    // Verificar que el admin existe y pertenece a la organización
    const admin = await this.userRepository.findOne({
      where: { id: adminId, organizationId },
    });

    if (!admin) {
      throw new ForbiddenException('No tienes permiso para invitar usuarios');
    }

    // Verificar que el email no existe en el sistema
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new BadRequestException(
        `El email ${normalizedEmail} ya está registrado`,
      );
    }

    // Verificar si hay invitación pendiente del mismo email
    const pendingInvites = await this.invitationRepository.find({
      where: {
        email: normalizedEmail,
        organizationId,
        status: InvitationStatus.PENDING,
      },
    });

    if (pendingInvites.length > 0) {
      throw new BadRequestException(
        `Ya existe una invitación pendiente para ${normalizedEmail}`,
      );
    }

    // Generar token aleatorio
    const plainToken = crypto.randomBytes(32).toString('hex');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tokenHash = await bcrypt.hash(plainToken, this.saltRounds);

    // Crear invitación
    const invitation = this.invitationRepository.create({
      email: normalizedEmail,
      role: role as Role,
      organizationId,
      invitedBy: adminId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tokenHash,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });

    await this.invitationRepository.save(invitation);

    // Enviar email con invitación
    try {
      const invitationLink = `${config.frontendUrl}/invitations/accept/${plainToken}`;
      const emailHtml = generateUserInvitationEmail({
        userEmail: normalizedEmail,
        organizationName: org.name,
        userRole: role,
        invitationLink,
        expiryDays: 7,
      });

      await this.emailService.sendEmail(
        normalizedEmail,
        `Invitación de ${org.name} - Biotasys`,
        emailHtml,
      );

      this.logger.log(`Email enviado a ${normalizedEmail}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${normalizedEmail}:`, error);
    }

    this.logger.log(
      `Invitación creada para ${normalizedEmail} en la organización ${org.name}`,
    );

    return plainToken;
  }

  /**
   * Listar invitaciones pendientes de la organización
   * @param organizationId ID de la organización
   * @returns Listado de invitaciones sin exponer el tokenHash
   */
  async listInvitations(organizationId: string) {
    const invitations = await this.invitationRepository.find({
      where: {
        organizationId,
        status: InvitationStatus.PENDING,
      },
      select: ['id', 'email', 'role', 'expiresAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return invitations;
  }

  /**
   * Revocar invitación pendiente
   * @param invitationId ID de la invitación
   * @param organizationId ID de la organización (para validar permisos)
   */
  async revokeInvitation(
    invitationId: string,
    organizationId: string,
  ): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, organizationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden revocar invitaciones pendientes',
      );
    }

    invitation.status = InvitationStatus.REVOKED;
    await this.invitationRepository.save(invitation);

    this.logger.log(`Invitación ${invitationId} revocada`);
  }

  /**
   * Listar usuarios de la organización
   * @param organizationId ID de la organización
   * @returns Listado de usuarios (excluyendo contraseña)
   */
  async listByOrganization(organizationId: string) {
    const users = await this.userRepository.find({
      where: { organizationId },
      select: ['id', 'email', 'fullName', 'role', 'status', 'lastLoginAt'],
      order: { createdAt: 'DESC' },
    });

    return users;
  }

  /**
   * Actualizar datos de usuario
   * @param userId ID del usuario a actualizar
   * @param organizationId ID de la organización
   * @param dto Datos a actualizar
   */
  async update(userId: string, organizationId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (dto.fullName) {
      user.fullName = dto.fullName.trim();
    }

    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Usuario ${user.email} actualizado`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      status: updatedUser.status,
    };
  }

  /**
   * Desactivar usuario
   * @param userId ID del usuario a desactivar
   * @param organizationId ID de la organización
   */
  async deactivate(userId: string, organizationId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException('Usuario ya está inactivo');
    }

    user.status = UserStatus.INACTIVE;
    await this.userRepository.save(user);

    this.logger.log(`Usuario ${user.email} desactivado`);
  }
}
