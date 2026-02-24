import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar datos de un usuario
 * Se usa en PATCH /api/users/:id
 * 
 * Nota sobre colegiadoNumber:
 * - Solo PROFESSIONAL y LAB_OPERATOR pueden tener número de colegiado
 * - ADMIN no puede tener este campo
 * - La validación de rol debe hacerse en el controller/servicio
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Maria',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Gomez',
    description: 'Apellidos del usuario',
    minLength: 2,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  lastName?: string;

  @ApiPropertyOptional({
    example: '083412345',
    description: 'Número de colegiado profesional (solo números y letras, 6-12 caracteres)',
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Número de colegiado debe tener al menos 6 caracteres' })
  @MaxLength(12, { message: 'Número de colegiado no puede exceder 12 caracteres' })
  @Matches(/^[0-9a-zA-Z]+$/, { 
    message: 'Número de colegiado solo puede contener números y letras' 
  })
  colegiadoNumber?: string;
}
