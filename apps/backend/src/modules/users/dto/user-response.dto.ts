/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiProperty({ example: 'Juan Pérez García', description: 'Nombre completo del usuario' })
  fullName!: string;

  @ApiPropertyOptional({
    example: 'BiomeSense',
    description: 'Nombre del laboratorio/centro (opcional)',
  })
  laboratory?: string | null;

  @ApiPropertyOptional({
    enum: Role,
    nullable: true,
    example: null,
    description: 'Rol seleccionado en login (puede ser null al registrarse)',
  })
  role!: Role | null;

  @ApiProperty({ example: true, description: 'Estado activo del usuario' })
  isActive!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el email ha sido verificado',
  })
  emailVerified!: boolean;

  @ApiPropertyOptional({
    example: '2026-03-03T10:30:00Z',
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
    example: false,
    required: false,
    description: 'Indica si se requiere logout para completar verificación de email',
  })
  requiresLogout?: boolean;
}
