import { IsEmail, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para crear invitación a profesional o lab_operator
 * POST /api/invitations
 */
export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum([Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'El rol debe ser "professional" o "lab_operator"',
  })
  @IsNotEmpty()
  role!: Role.PROFESSIONAL | Role.LAB_OPERATOR;

  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;
}
