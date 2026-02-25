import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'María Silvia',
    description: 'Nombre de pila del usuario',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'García López',
    description: 'Apellidos completos del usuario',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName?: string;

  @ApiPropertyOptional({
    example: '280812345',
    description: 'Número de colegiado profesional (6-12 caracteres)',
    minLength: 6,
    maxLength: 12,
    pattern: '^[0-9a-zA-Z]+$',
  })
  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: 'Número de colegiado debe tener al menos 6 caracteres',
  })
  @MaxLength(12, {
    message: 'Número de colegiado no puede exceder 12 caracteres',
  })
  @Matches(/^[0-9a-zA-Z]+$/, {
    message: 'Número de colegiado solo puede contener números y letras',
  })
  colegiadoNumber?: string;
}
