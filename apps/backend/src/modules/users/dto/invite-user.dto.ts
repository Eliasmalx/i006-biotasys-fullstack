import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para invitar usuario final (professional o lab_operator)
 * POST /api/admin/invitations
 */
export class InviteUserDto {
  @ApiProperty({
    example: 'profesional@clinica.com',
    description: 'Email del usuario a invitar',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email valido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @ApiProperty({
    example: 'professional',
    enum: [Role.PROFESSIONAL, Role.LAB_OPERATOR],
    description: 'Rol del usuario invitado',
  })
  @IsEnum([Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'El rol debe ser "professional" o "lab_operator"',
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role!: 'professional' | 'lab_operator';
}
