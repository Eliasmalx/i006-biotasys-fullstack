import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO para login de usuario
 * POST /api/auth/login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
