/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { EmailService } from '../../infrastructure/email/services/email.service';
import { generateAdminInvitationEmail } from '../../infrastructure/email/template';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { OrgStatus } from '../../common/enums/org-status.enum';
import config from '../../config/dotenv.config';
import * as crypto from 'crypto';

interface InviteAdminDto {
  organizationName?: string;
  adminEmail: string;
}

/**
 * OrganizationsService
 * Gestiona organizaciones y las invitaciones de administradores
 * (Consolidada de SuperadminUsersService)
 */
@Injectable()
export class OrganizationsService {
  private readonly saltRounds = 10;
  private readonly invitationExpiryDays = 7;
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea una nueva organización e invita al administrador
   * @param superadminId UUID del superadmin que crea la organización
   * @param dto Datos: nombre de org y email del admin
   * @returns Token de invitación para enviar por email
   */
  async createOrganizationAndInviteAdmin(
    superadminId: string,
    dto: InviteAdminDto,
  ): Promise<string> {
    const normalizedEmail = dto.adminEmail.toLowerCase().trim();

    // Validar email no existe
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        `El email ${normalizedEmail} ya está registrado en el sistema`,
      );
    }

    // Validar no hay invitación pendiente
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
    const org = this.orgRepo.create({
      name:
        dto.organizationName?.trim() || `Organización de ${normalizedEmail}`,
      status: OrgStatus.ACTIVE,
      createdBy: superadminId,
    });

    await this.orgRepo.save(org);

    // Generar token de invitación
    const token = crypto.randomBytes(32).toString('hex');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    // Crear invitación
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.invitationExpiryDays);

    const invitation = this.invitationRepository.create({
      tokenHash,
      email: normalizedEmail,
      role: Role.ADMIN,
      organizationId: org.id,
      invitedBy: superadminId,
      status: InvitationStatus.PENDING,
      expiresAt,
    });

    await this.invitationRepository.save(invitation);

    // Enviar email
    try {
      const invitationLink = `${config.frontendUrl}/invitations/accept/${token}`;
      const emailHtml = generateAdminInvitationEmail({
        adminEmail: normalizedEmail,
        organizationName: org.name,
        invitationLink,
        expiryDays: this.invitationExpiryDays,
      });

      await this.emailService.sendEmail(
        normalizedEmail,
        'Invitación de Administrador - Biotasys',
        emailHtml,
      );

      this.logger.log(`Invitación enviada a ${normalizedEmail}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${normalizedEmail}:`, error);
    }

    return token;
  }

  create(dto: CreateOrganizationDto) {
    const org = this.orgRepo.create(dto);
    return this.orgRepo.save(org);
  }

  findAll() {
    return this.orgRepo.find();
  }

  async findOne(id: string) {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org) throw new NotFoundException('Organization not found');
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async remove(id: string) {
    const result = await this.orgRepo.delete({ id });
    if (!result.affected) throw new NotFoundException('Organization not found');
  }
}
