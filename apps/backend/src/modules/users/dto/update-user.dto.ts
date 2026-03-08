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
 * Todos los campos son opcionales
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName?: string;

  @ApiProperty({
    example: 'Pérez García',
    description: 'Apellido del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName?: string;

  @ApiProperty({
    example: 'juan.nuevo@example.com',
    description: 'Nuevo correo electrónico (requerirá verificación)',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email?: string;

  @ApiProperty({
    example: 'NuevaPassword123!',
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  password?: string;

  @ApiProperty({
    example: 'Laboratorio Clínico Central',
    description: 'Nombre del laboratorio o centro (solo para usuarios laboratorio)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El laboratorio debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El laboratorio no puede exceder 150 caracteres' })
  laboratory?: string;
}
