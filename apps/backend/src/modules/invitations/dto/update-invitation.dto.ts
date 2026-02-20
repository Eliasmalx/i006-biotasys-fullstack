import { IsEnum, IsOptional } from 'class-validator';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';

export class UpdateInvitationDto {
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}
