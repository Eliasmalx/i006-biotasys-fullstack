import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePatienDto } from './create-patients.dto';

/**
 * DTO para actualizar un paciente
 * PATCH /api/patients/:id
 */
export class UpdatePatienDto extends PartialType(CreatePatienDto) {
  @ApiPropertyOptional({
    example: 'Carlos',
    description: 'Nombre del paciente',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Rodriguez',
    description: 'Apellido del paciente',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'carlos.rod@email.com',
    description: 'Correo electronico de contacto (opcional)',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email valido' })
  @IsOptional()
  email?: string;
}
