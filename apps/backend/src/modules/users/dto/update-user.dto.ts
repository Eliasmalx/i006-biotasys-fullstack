import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar datos de un usuario
 * Se usa en PATCH /api/users/:id
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
    description: 'Número de colegiado profesional',
  })
  @IsString()
  @IsOptional()
  colegiadoNumber?: string;
}
