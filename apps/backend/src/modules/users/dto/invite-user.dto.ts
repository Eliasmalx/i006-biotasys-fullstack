import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para invitar usuario final (professional o lab_operator)
 * POST /api/admin/invitations
 */
export class InviteUserDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsEnum([Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'El rol debe ser "professional" o "lab_operator"',
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  role!: 'professional' | 'lab_operator';
}
