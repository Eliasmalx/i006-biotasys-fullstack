import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';

export class UpdateInvitationDto {
  @ApiPropertyOptional({
    enum: InvitationStatus,
    example: InvitationStatus.ACCEPTED,
    description: 'Nuevo estado de la invitacion',
  })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}
