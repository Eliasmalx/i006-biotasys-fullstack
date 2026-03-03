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
import { QueryFailedError, Repository } from 'typeorm';
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
   * @param superadminId ID del superadmin (usuario autenticado) que crea la organización
   * @param dto Datos de la organización y admin a invitar
   * @returns invitationToken (plaintext) para poder probar el flujo en Swagger/QA
   * @throws ConflictException si email, cif o centerId ya existen
   * @throws NotFoundException si superadminId no existe
   */
  async createOrganizationAndInviteAdmin(
    superadminId: string,
    dto: CreateOrganizationDto,
  ): Promise<string> {
    // Validar que el superadmin existe
    const superadmin = await this.userRepo.findOne({
      where: { id: superadminId },
    });
    if (!superadmin) {
      throw new NotFoundException('Superadmin no encontrado');
    }

    const email = dto.adminEmail.toLowerCase().trim();

    // 1. Validaciones
    const userExists = await this.userRepo.findOne({ where: { email } });
    if (userExists) {
      throw new ConflictException(
        'Este email ya está registrado en el sistema',
      );
    }

    const orgExists = await this.orgRepo.findOne({ where: { cif: dto.cif } });
    if (orgExists) {
      throw new ConflictException('Ya existe una organización con este CIF');
    }

    const centerExists = await this.orgRepo.findOne({
      where: { centerId: dto.centerId },
    });
    if (centerExists) {
      throw new ConflictException(
        'Ya existe una organización con este centerId',
      );
    }

    // 2. Crear Organización
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

    let savedOrg: Organization;
    try {
      savedOrg = await this.orgRepo.save(org);
    } catch (err) {
      // Blindaje extra ante carreras / unique constraints
      if (
        err instanceof QueryFailedError &&
        (err as any).driverError?.code === '23505'
      ) {
        const detail = (err as any).driverError?.detail ?? '';
        if (detail.includes('("centerId")')) {
          throw new ConflictException(
            'Ya existe una organización con este centerId',
          );
        }
        if (detail.includes('("cif")')) {
          throw new ConflictException(
            'Ya existe una organización con este CIF',
          );
        }
        throw new ConflictException('Organización duplicada');
      }
      throw err;
    }

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
        `Error enviando email a ${email}: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`,
      );
      // No bloqueamos la creación si el email falla
    }

    // ✅ devolvemos el token para verlo en Swagger
    return token;
  }

  // --- MÉTODOS DE MANTENIMIENTO ---

  /**
   * Obtener todas las organizaciones
   * @returns Lista de todas las organizaciones del sistema
   */
  async findAll(): Promise<Organization[]> {
    this.logger.debug('Listando todas las organizaciones');
    return await this.orgRepo.find();
  }

  /**
   * Obtener una organización por ID
   * @param id ID único de la organización (UUID)
   * @returns Datos completos de la organización
   * @throws NotFoundException si la organización no existe
   */
  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org) {
      this.logger.warn(`Intento de acceso a organización inexistente: ${id}`);
      const errorMsg = `Organización con ID ${id} no encontrada`;
      throw new NotFoundException(errorMsg);
    }
    return org;
  }

  /**
   * Actualizar datos de la organización
   * @param id ID único de la organización (UUID)
   * @param dto Datos a actualizar
   * @param userId ID del usuario que realiza la actualización (para auditoría)
   * @returns Organización actualizada
   * @throws NotFoundException si la organización no existe
   */
  async update(
    id: string,
    dto: UpdateOrganizationDto,
    userId: string,
  ): Promise<Organization> {
    const org = await this.findOne(id);

    const previousState = { ...org };

    const safeUpdates = {
      name: dto.organizationName,
      address: dto.address,
      city: dto.city,
      phone: dto.phone,
      specialty: dto.specialty,
    } as Partial<Organization>;

    const updated = this.orgRepo.merge(org, safeUpdates);
    const result = await this.orgRepo.save(updated);

    // Auditoría: registrar qué cambió
    const changes = Object.keys(safeUpdates).filter(
      (key) =>
        previousState[key as keyof Organization] !==
        safeUpdates[key as keyof Organization],
    );

    this.logger.log(
      `Organización actualizada por ${userId}: ${org.id} | Campos: ${changes.join(', ')}`,
    );

    return result;
  }

  /**
   * Desactivar una organización (soft delete)
   * @param id ID único de la organización (UUID)
   * @param userId ID del usuario que desactiva la organización (para auditoría)
   * @returns Promise<void>
   * @throws NotFoundException si la organización no existe
   * @throws ConflictException si la organización ya está inactiva
   */
  async remove(id: string, userId: string): Promise<void> {
    const org = await this.findOne(id);

    if (org.status === OrgStatus.INACTIVE) {
      throw new ConflictException('La organización ya está inactiva');
    }

    org.status = OrgStatus.INACTIVE;
    await this.orgRepo.save(org);

    this.logger.warn(
      `Organización desactivada por ${userId}: ${org.name} (${org.id})`,
    );
  }
}
