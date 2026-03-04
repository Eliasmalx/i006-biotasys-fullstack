import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo usuario (registro)
 * Campos requeridos según UX/UI:
 * - Nombre
 * - Apellido
 * - Correo electrónico
 * - Contraseña
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName!: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico único',
  })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Contraseña (mínimo 8 caracteres)',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  password!: string;
}
