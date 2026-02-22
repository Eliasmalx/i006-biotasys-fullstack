import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para crear una organización e invitar al administrador
 * POST /api/organizations
 */
export class InviteAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la organización es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  organizationName!: string;

  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email del administrador es requerido' })
  adminEmail!: string;
}
