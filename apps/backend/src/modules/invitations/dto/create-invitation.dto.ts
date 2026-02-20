import { IsEmail, IsEnum, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;

  @IsUUID()
  organizationId!: string;
}
