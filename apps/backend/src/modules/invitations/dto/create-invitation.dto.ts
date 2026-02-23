import { IsEmail, IsEnum, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear invitación a profesional o lab_operator
 * POST /api/invitations
 */
export class CreateInvitationDto {
  @ApiProperty({
    example: 'doctor.perez@biotasys.com',
    description: 'Correo electrónico de la persona invitada'
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'professional',
    enum: [Role.PROFESSIONAL, Role.LAB_OPERATOR],
    description: 'Rol que tendrá el usuario (professional o lab_operator)'
  })
  @IsEnum([Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'El rol debe ser "professional" o "lab_operator"',
  })
  @IsNotEmpty()
  role!: Role.PROFESSIONAL | Role.LAB_OPERATOR;

  @ApiHideProperty()
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;
}
