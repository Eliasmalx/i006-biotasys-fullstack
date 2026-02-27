/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { Role } from '../../common/enums/role.enum';
import { EmailService } from '../../infrastructure/email/services/email.service';
import { Organization } from '../organizations/entities/organization.entity';
import config from '../../config/dotenv.config';
import * as bcrypt from 'bcrypt';

export interface CreateInvitationResult {
  invitation: Invitation;
  debug?: {
    invitationToken: string;
    invitationLink: string;
  };
}

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    @InjectRepository(Organization)
    private readonly organizationRepo: Repository<Organization>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crear una invitación para profesional o lab_operator
   * @param dto Datos de la invitación
   * @param invitedByUserId ID del admin que envía la invitación
   * @param organizationId ID de la organización
   * @returns Invitación creada
   * @description Valida que colegiadoNumber sea requerido para PROFESSIONAL y LAB_OPERATOR
   */
  async create(
    dto: CreateInvitationDto,
    invitedByUserId: string,
    organizationId: string,
  ): Promise<CreateInvitationResult> {
    // Validar que colegiadoNumber es requerido para PROFESSIONAL y LAB_OPERATOR
    if (
      (dto.role === Role.PROFESSIONAL || dto.role === Role.LAB_OPERATOR) &&
      !dto.colegiadoNumber
    ) {
      throw new BadRequestException(
        `El número de colegiado es requerido para ${dto.role}`,
      );
    }

    // Validar que ADMIN no tenga colegiadoNumber
    if (dto.role === Role.ADMIN && dto.colegiadoNumber) {
      throw new BadRequestException(
        'Los Administradores no requieren número de colegiado',
      );
    }

    // 1. Generamos la "llave" (token plano de 64 caracteres)
    const token = randomBytes(32).toString('hex');

    // 2. Generamos el "candado" compatible (Hash con Bcrypt)
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    const professionalId = this.generateProfessionalId(organizationId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationsRepo.create({
      ...dto,
      professionalId,
      organizationId,
      invitedBy: invitedByUserId,
      tokenHash,
      expiresAt,
      status: InvitationStatus.PENDING,
    });

    const saved = await this.invitationsRepo.save(invitation);

    // 3. Envío de email con template
    const invitationLink = `${config.frontendUrl}/invitations/accept/${token}`;
    try {
      // Obtener nombre de la organización
      const organization = await this.organizationRepo.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        this.logger.warn(`Organización ${organizationId} no encontrada`);
      }

      const userRole =
        dto.role === Role.PROFESSIONAL ? 'professional' : 'lab_operator';

      await this.emailService.sendUserInvitationEmail(
        dto.email,
        organization?.name || 'Biotasys',
        userRole,
        invitationLink,
      );
      this.logger.log(
        `Email de invitación enviado a ${dto.email} (profesional: ${professionalId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email de invitación a ${dto.email}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      // No bloqueamos la creación si el email falla
    }

    // Retornamos la invitación SIN el token (seguridad)
    if (process.env.NODE_ENV !== 'production') {
      return {
        invitation: saved,
        debug: {
          invitationToken: token,
          invitationLink,
        },
      };
    }

    return { invitation: saved };
  }

  /**
   * Genera ID profesional único por organización usando UUID
   * @param organizationId ID de la organización
   * @returns ID profesional en formato BIO-YYYY-PAÍS-UUID_CORTO (sin race conditions)
   */
  private generateProfessionalId(organizationId: string): string {
    const year = new Date().getFullYear();
    const country = 'AR';
    const uniqueId = uuidv4().substring(0, 8).toUpperCase();

    return `BIO-${year}-${country}-${uniqueId}`;
  }

  /**
   * Obtener todas las invitaciones de una organización
   * @param organizationId ID de la organización
   * @returns Lista de invitaciones (pendientes y aceptadas)
   */
  async findAllByOrganization(organizationId: string) {
    return await this.invitationsRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar estado de una invitación
   * @param id ID de la invitación
   * @param dto Datos a actualizar (principalmente estado)
   * @returns Invitación actualizada
   */
  async update(id: string, dto: UpdateInvitationDto) {
    const invitation = await this.invitationsRepo.findOneBy({ id });
    if (!invitation) throw new NotFoundException('Invitación no encontrada');

    if (dto.status) {
      invitation.status = dto.status;
      if (dto.status === InvitationStatus.ACCEPTED && !invitation.acceptedAt) {
        invitation.acceptedAt = new Date();
      }
    }
    return await this.invitationsRepo.save(invitation);
  }
}
