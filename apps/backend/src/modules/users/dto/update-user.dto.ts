import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO para actualizar un usuario existente
 * Requiere contraseña actual para validación de seguridad
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Contraseña actual (requerida para validación de seguridad)',
    required: true,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  currentPassword!: string;

  @ApiProperty({
    example: 'Juan Pérez García',
    description: 'Nombre completo del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  fullName?: string;

  @ApiProperty({
    example: 'juan.nuevo@example.com',
    description: 'Nuevo correo electrónico (requerirá verificación)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email?: string;

  @ApiProperty({
    example: 'Laboratorio Central',
    description: 'Nombre del laboratorio (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  laboratory?: string;
}
