import {
  Injectable,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { EmailService } from '../../infrastructure/email/services/email.service';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { OrgStatus } from '../../common/enums/org-status.enum'; // <--- SIGUE AQUÍ

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
   * Crea la organización y genera la invitación del Admin
   */
  async createOrganizationAndInviteAdmin(
    superadminId: string,
    dto: CreateOrganizationDto,
  ): Promise<string> {
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
      status: OrgStatus.ACTIVE, // <--- AQUÍ SE ASIGNA EL ESTADO ACTIVO
      createdBy: superadminId,
    });
    const savedOrg = await this.orgRepo.save(org);

    // 3. Generar Token e Invitación
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    const invitation = this.invRepo.create({
      tokenHash,
      email,
      firstName: dto.adminFullName.split(' ')[0],
      lastName: dto.adminFullName.split(' ').slice(1).join(' ') || 'Admin',
      dni: dto.adminDni,
      professionalId: dto.adminProfessionalId,
      role: Role.ADMIN,
      organizationId: savedOrg.id,
      invitedBy: superadminId,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    });
    await this.invRepo.save(invitation);

    // Nota: Aquí llamarías a emailService.sendEmail si lo tienes configurado

    return token;
  }

  // --- MÉTODOS DE MANTENIMIENTO ---

  async findAll() {
    return await this.orgRepo.find();
  }

  async findOne(id: string) {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org)
      throw new NotFoundException(`Organización con ID ${id} no encontrada`);
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    // Merge actualiza los campos que vengan en el DTO
    const updated = this.orgRepo.merge(org, dto);
    return await this.orgRepo.save(updated);
  }

  async remove(id: string) {
    const org = await this.findOne(id);
    await this.orgRepo.remove(org);
  }
}
