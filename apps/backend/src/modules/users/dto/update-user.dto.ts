import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar datos de un usuario
 * PATCH /api/admin/users/:id
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Dra. Maria Gomez',
    description: 'Nombre completo del usuario',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  fullName?: string;
}
