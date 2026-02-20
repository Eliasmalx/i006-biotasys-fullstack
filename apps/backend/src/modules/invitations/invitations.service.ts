import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
  ) {}
  async create(dto: CreateInvitationDto, invitedByUserId: string) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationsRepo.create({
      ...dto,
      invitedBy: invitedByUserId,
      tokenHash,
      expiresAt,
    });

    const saved = await this.invitationsRepo.save(invitation);

    const { tokenHash: _tokenHash, ...safe } = saved;
    void _tokenHash;
    return { ...safe, token };
  }
  async update(id: string, dto: UpdateInvitationDto) {
    const invitation = await this.invitationsRepo.findOneBy({ id });
    if (!invitation) throw new NotFoundException('Invitation not found');

    if (dto.status) {
      invitation.status = dto.status;
      if (dto.status === InvitationStatus.ACCEPTED && !invitation.acceptedAt) {
        invitation.acceptedAt = new Date();
      }
    }

    const saved = await this.invitationsRepo.save(invitation);
    const { tokenHash: _tokenHash, ...safe } = saved;
    void _tokenHash;
    return safe;
  }
}
