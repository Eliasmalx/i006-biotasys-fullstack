/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { EmailService } from '../../infrastructure/email/services/email.service';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { OrgStatus } from '../../common/enums/org-status.enum';
import config from '../../config/dotenv.config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  private readonly saltRounds = 10;
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private readonly invRepo: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crear organización e invitar al administrador
   * @param superadminId ID del superadmin que crea la organización
   * @param dto Datos de la organización y admin a invitar
   * @description El token se envía solo al email del admin, nunca se devuelve al cliente
   */
  async createOrganizationAndInviteAdmin(
    superadminId: string,
    dto: CreateOrganizationDto,
  ): Promise<void> {
    const email = dto.adminEmail.toLowerCase().trim();

    // 1. Validaciones
    const userExists = await this.userRepo.findOne({ where: { email } });
    if (userExists)
      throw new ConflictException(
        'Este email ya está registrado en el sistema',
      );

    const orgExists = await this.orgRepo.findOne({ where: { cif: dto.cif } });
    if (orgExists)
      throw new ConflictException('Ya existe una organización con este CIF');

    // 2. Crear Organización (Aquí usamos OrgStatus)
    const org = this.orgRepo.create({
      name: dto.organizationName,
      cif: dto.cif,
      address: dto.address,
      city: dto.city,
      phone: dto.phone,
      specialty: dto.specialty,
      centerId: dto.centerId,
      status: OrgStatus.ACTIVE,
      createdBy: superadminId,
    });
    const savedOrg = await this.orgRepo.save(org);

    // 3. Generar Token e Invitación
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    const invitation = this.invRepo.create({
      tokenHash,
      email,
      firstName: dto.adminFullName.trim().split(/\s+/)[0],
      lastName: dto.adminFullName.trim().split(/\s+/).slice(1).join(' '),
      dni: dto.adminDni,
      professionalId: dto.adminProfessionalId,
      role: Role.ADMIN,
      organizationId: savedOrg.id,
      invitedBy: superadminId,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });
    await this.invRepo.save(invitation);

    // Enviar email de invitación al admin
    const invitationLink = `${config.frontendUrl}/invitations/accept/${token}`;
    try {
      await this.emailService.sendOrgAdminInvitationEmail(
        email,
        dto.adminFullName,
        invitationLink,
      );
      this.logger.log(`Email de invitación enviado a ${email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email a ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      // No bloqueamos la creación si el email falla
    }
  }

  // --- MÉTODOS DE MANTENIMIENTO ---

  /**
   * Obtener todas las organizaciones (restringido a SUPERADMIN)
   * @returns Lista de todas las organizaciones
   */
  async findAll() {
    return await this.orgRepo.find();
  }

  /**
   * Obtener una organización por ID
   * @param id ID de la organización
   * @returns Datos de la organización
   */
  async findOne(id: string) {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org)
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    return org;
  }

  /**
   * Actualizar datos de una organización
   * @param id ID de la organización
   * @param dto Datos a actualizar
   * @returns Organización actualizada
   */
  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.findOne(id);

    // Sanitizar el DTO para evitar cambios de campos sensibles
    const safeUpdates = {
      name: dto.organizationName,
      address: dto.address,
      city: dto.city,
      phone: dto.phone,
      specialty: dto.specialty,
    } as Partial<Organization>;

    const updated = this.orgRepo.merge(org, safeUpdates);
    return await this.orgRepo.save(updated);
  }

  /**
   * Desactivar una organización (soft delete)
   * @param id ID de la organización
   */
  async remove(id: string): Promise<void> {
    const org = await this.findOne(id);

    if (org.status === OrgStatus.INACTIVE) {
      throw new ConflictException('La organización ya está inactiva');
    }

    org.status = OrgStatus.INACTIVE;
    await this.orgRepo.save(org);
    this.logger.log(`Organización desactivada: ${org.name} (${org.id})`);
  }
}
