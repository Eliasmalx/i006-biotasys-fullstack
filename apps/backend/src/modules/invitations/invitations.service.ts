import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { EmailService } from '../../infrastructure/email/services/email.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea una invitación compatible con la seguridad de AuthService
   */
  async create(
    dto: CreateInvitationDto,
    invitedByUserId: string,
    organizationId: string,
  ) {
    // 1. Generamos la "llave" (token plano de 64 caracteres)
    const token = randomBytes(32).toString('hex');

    // 2. Generamos el "candado" compatible (Hash con Bcrypt)
    // Esto es lo que arregla el Bad Request 400
    const tokenHash = await bcrypt.hash(token, this.saltRounds);

    const professionalId = await this.generateProfessionalId(organizationId);

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

    // 3. Envío de email blindado (para que no rompa si falla el .env)
    try {
      await this.emailService.sendEmail(
        dto.email,
        'Invitación a Biotasys',
        `Tu token de registro es: ${token}`,
      );
      this.logger.log(`Email enviado a ${dto.email}`);
    } catch (error) {
      this.logger.warn(
        `Email no enviado (BadCredentials), usa este token en Postman: ${token}`,
      );
    }

    // Retornamos el token plano para que lo veas en Postman
    const { tokenHash: _tokenHash, ...safeData } = saved;
    void _tokenHash;
    return { ...safeData, token };
  }

  /**
   * Genera el ID profesional secuencial por clínica
   */
  private async generateProfessionalId(
    organizationId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const country = 'AR';

    const count = await this.invitationsRepo.count({
      where: { organizationId },
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    return `BIO-${year}-${country}-${sequence}`;
  }

  /**
   * Listado de profesionales de la clínica (Foto 2 del Figma)
   */
  async findAllByOrganization(organizationId: string) {
    return await this.invitationsRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar estado manualmente (usado por el sistema)
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
