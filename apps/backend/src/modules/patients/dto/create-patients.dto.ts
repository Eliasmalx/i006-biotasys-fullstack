import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo paciente
 * POST /api/patients
 */
export class CreatePatienDto {
  @ApiProperty({
    example: 'Carlos',
    description: 'Nombre del paciente',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName!: string;

  @ApiProperty({
    example: 'Rodríguez',
    description: 'Apellido del paciente',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  lastName!: string;

  @ApiProperty({
    example: 'carlos.rod@email.com',
    description: 'Correo electrónico de contacto (opcional)',
    required: false,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;
}
