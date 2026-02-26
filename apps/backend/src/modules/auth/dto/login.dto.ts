import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO para login de usuario
 * POST /api/auth/login
 */
export class LoginDto {
  @ApiProperty({
    example: 'superadmin@local.test',
    description: 'Email del usuario para iniciar sesión',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña de acceso (mínimo 8 caracteres)',
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}
