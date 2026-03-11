import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

/**
 * DTO para crear un nuevo usuario (registro)
 * Campos requeridos según UX/UI:
 * - Nombre completo
 * - Correo electrónico
 * - Contraseña
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  fullName!: string;

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

  @ApiProperty({
    example: 'Laboratorio Central',
    description: 'Nombre del laboratorio (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  laboratory?: string;
}
