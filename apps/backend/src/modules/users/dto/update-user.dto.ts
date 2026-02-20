import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para actualizar datos de un usuario
 * PATCH /api/admin/users/:id
 */
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  fullName?: string;
}
