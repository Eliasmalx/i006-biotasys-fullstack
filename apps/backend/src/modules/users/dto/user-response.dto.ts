/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para respuestas de usuario
 * No incluye contrasena por seguridad
 */
export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID unico del usuario',
  })
  id!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electronico',
  })
  email!: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  firstName!: string;

  @ApiProperty({ example: 'Perez Garcia', description: 'Apellido del usuario' })
  lastName!: string;

  @ApiProperty({
    enum: Role,
    example: Role.NUTRICIONISTA,
    description: 'Rol del usuario (seleccionado en login)',
  })
  role!: Role;

  @ApiProperty({ example: true, description: 'Estado activo del usuario' })
  isActive!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el email ha sido verificado',
  })
  emailVerified!: boolean;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    required: false,
    description: 'Ultimo login',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    description: 'Fecha de creacion',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    description: 'Fecha de actualizacion',
  })
  updatedAt!: Date;

  @ApiProperty({
    example:
      '9F0BC2D15A6B4D6C9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2',
    required: false,
    description:
      'Token de verificacion (solo desarrollo, no disponible en produccion)',
  })
  verificationToken?: string;

  @ApiProperty({
    example:
      'http://localhost:3001/auth/verify-email?token=9F0BC2D15A6B4D6C9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2',
    required: false,
    description:
      'Link de verificacion (solo desarrollo, no disponible en produccion)',
  })
  verificationLink?: string;
}
