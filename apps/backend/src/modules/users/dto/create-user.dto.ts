import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo usuario (registro)
 * Campos requeridos segun UX/UI:
 * - Nombre
 * - Apellido
 * - Correo electronico
 * - Contrasena
 * Campo opcional:
 * - Laboratorio/Centro
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  firstName!: string;

  @ApiProperty({
    example: 'Perez Garcia',
    description: 'Apellido del usuario',
  })
  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electronico unico',
  })
  @IsEmail({}, { message: 'Correo electronico invalido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Contrasena (minimo 8 caracteres)',
  })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contrasena no puede exceder 128 caracteres' })
  password!: string;

  @ApiPropertyOptional({
    example: 'BiomeSense',
    description: 'Nombre del laboratorio/centro donde opera (opcional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El laboratorio no puede exceder 120 caracteres' })
  laboratory?: string;
}
