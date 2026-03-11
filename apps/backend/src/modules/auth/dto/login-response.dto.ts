import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO de respuesta para login
 */
export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT (30 minutos)',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token para refrescar el acceso (7 días)',
  })
  refreshToken!: string;

  @ApiProperty({
    example: 1800,
    description: 'Segundos hasta que expire el access token',
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Datos básicos del usuario logueado',
  })
  user!: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    organizationId?: string;
  };
}
