import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo paciente
 * POST /api/patients
 */
export class CreatePatienDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  lastName!: string;

  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsOptional()
  email?: string;
}
