/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para respuestas de usuario
 * No incluye contraseña por seguridad
 */
export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del usuario',
  })
  id!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico',
  })
  email!: string;

  @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
  firstName!: string;

  @ApiProperty({ example: 'Pérez García', description: 'Apellido del usuario' })
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
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
    description: 'ID de la organización',
  })
  organizationId?: string;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    required: false,
    description: 'Último login',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-03-03T10:30:00Z',
    description: 'Fecha de actualización',
  })
  updatedAt!: Date;
}
