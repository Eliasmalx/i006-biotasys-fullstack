import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para aceptar una invitación y completar el registro
 * POST /api/auth/accept-invitation
 */
export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  @MinLength(64, { message: 'Token inválido' })
  token!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  password!: string;
}
