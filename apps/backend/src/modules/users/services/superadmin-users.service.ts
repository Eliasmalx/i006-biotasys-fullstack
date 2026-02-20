/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';
import { EmailService } from '../../../infrastructure/email/services/email.service';
import { generateAdminInvitationEmail } from '../../../infrastructure/email/template';
import { Role } from '../../../common/enums/role.enum';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';
import { OrgStatus } from '../../../common/enums/org-status.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';
import config from '../../../config/dotenv.config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

interface CreateAdminOrgDto {
  organizationName: string;
  adminEmail: string;
}

interface UpdateOrganizationDto {
  name?: string;
  status?: OrgStatus;
}

/**
 * Servicio para la gestión de administradores y organizaciones por el superadmin
 * Responsabilidades:
 * - Crear organizaciones e invitar primeros administradores
 * - Listar y actualizar organizaciones
 * - Gestionar invitaciones de admins (listar, revocar)
 * - Aceptar invitaciones y crear usuarios admin
 */
@Injectable()
export class SuperadminUsersService {
  private readonly saltRounds = 10;
  private readonly invitationExpiryDays = 7; // 7 días para aceptar invitación
  private readonly logger = new Logger(SuperadminUsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea una nueva organización e invita al administrador
   * @param superadminId UUID del superadmin que crea la organización
   * @param dto Datos: nombre de org y email del admin
   * @returns Token de invitación en texto plano (para email)
   */
  async createOrganizationAndInviteAdmin(
    superadminId: string,
    dto: CreateAdminOrgDto,
  ): Promise<string> {
    // Validar email del admin
    const normalizedEmail = dto.adminEmail.toLowerCase().trim();
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        `El email ${normalizedEmail} ya está registrado en el sistema`,
      );
    }

    // Validar que no existe invitación pendiente para este email
    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        email: normalizedEmail,
        status: InvitationStatus.PENDING,
      },
    });

    if (existingInvitation) {
      throw new ConflictException(
        `Ya existe una invitación pendiente para ${normalizedEmail}`,
      );
    }

    // Crear organización
    const organization = this.organizationRepository.create({
      name: dto.organizationName.trim(),
      createdBy: superadminId,
      status: OrgStatus.ACTIVE,
    });

    await this.organizationRepository.save(organization);

    // Generar token de invitación
    const token = crypto.randomBytes(32).toString('hex');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    // Crear invitación
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.invitationExpiryDays);

    const invitation = this.invitationRepository.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      tokenHash,
      email: normalizedEmail,
      role: Role.ADMIN,
      organizationId: organization.id,
      invitedBy: superadminId,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    await this.invitationRepository.save(invitation);

    // Enviar email con la invitación
    try {
      const invitationLink = `${config.frontendUrl}/invitations/accept/${token}`;
      const emailHtml = generateAdminInvitationEmail({
        adminEmail: normalizedEmail,
        organizationName: dto.organizationName.trim(),
        invitationLink,
        expiryDays: this.invitationExpiryDays,
      });

      await this.emailService.sendEmail(
        normalizedEmail,
        'Invitación de Administrador - Biotasys',
        emailHtml,
      );

      this.logger.log(
        `Invitación enviada a ${normalizedEmail} para organización ${organization.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar email de invitación a ${normalizedEmail}:`,
        error,
      );
      // No lanzar excepción, la invitación se creó correctamente
      // El token se puede usar aunque el email falle
    }

    // Retornar token en texto plano (para enviar en email)
    return token;
  }

  /**
   * Lista todas las organizaciones
   * @returns Array de organizaciones
   */
  async listOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene una organización por ID
   * @param organizationId UUID de la organización
   * @returns Organización
   * @throws NotFoundException si no existe
   */
  async getOrganizationById(organizationId: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException(
        `Organización con ID ${organizationId} no encontrada`,
      );
    }

    return organization;
  }

  /**
   * Actualiza una organización
   * @param organizationId UUID de la organización
   * @param dto Datos a actualizar
   * @returns Organización actualizada
   */
  async updateOrganization(
    organizationId: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.getOrganizationById(organizationId);

    if (dto.name) {
      organization.name = dto.name.trim();
    }

    if (dto.status) {
      organization.status = dto.status;
    }

    return this.organizationRepository.save(organization);
  }

  /**
   * Lista todas las invitaciones de admins pendientes
   * @returns Array de invitaciones
   */
  async listAdminInvitations(): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: {
        role: Role.ADMIN,
        status: InvitationStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Revoca una invitación
   * @param invitationId UUID de la invitación
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID ${invitationId} no encontrada`,
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `No se puede revocar una invitación con estado ${invitation.status}`,
      );
    }

    invitation.status = InvitationStatus.REVOKED;
    await this.invitationRepository.save(invitation);
  }

  /**
   * Verifica y acepta una invitación, creando el usuario admin
   * @param token Token de invitación en texto plano
   * @param fullName Nombre completo del admin
   * @param password Contraseña del admin
   * @returns Usuario admin creado
   */
  async acceptInvitation(
    token: string,
    fullName: string,
    password: string,
  ): Promise<User> {
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

    // Buscar invitación
    const invitations = await this.invitationRepository.find({
      where: {
        role: Role.ADMIN,
        status: InvitationStatus.PENDING,
      },
    });

    let validInvitation: Invitation | null = null;

    for (const inv of invitations) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const isValid = await bcrypt.compare(token, inv.tokenHash);
      if (isValid) {
        validInvitation = inv;
        break;
      }
    }

    if (!validInvitation) {
      throw new BadRequestException('Token de invitación inválido o expirado');
    }

    // Validar expiración
    if (new Date() > validInvitation.expiresAt) {
      validInvitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(validInvitation);
      throw new BadRequestException('Invitación expirada');
    }

    // Hashear contraseña
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Crear usuario admin
    const user = this.userRepository.create({
      email: validInvitation.email,
      fullName: fullName.trim(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      passwordHash,
      role: Role.ADMIN,
      organizationId: validInvitation.organizationId,
      invitationId: validInvitation.id,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // Marcar invitación como aceptada
    validInvitation.status = InvitationStatus.ACCEPTED;
    validInvitation.acceptedAt = new Date();
    await this.invitationRepository.save(validInvitation);

    return savedUser;
  }
}
