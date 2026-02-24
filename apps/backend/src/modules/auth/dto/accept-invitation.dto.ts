import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para aceptar una invitación y completar el registro
 * POST /api/auth/accept-invitation
 */
export class AcceptInvitationDto {
  @ApiProperty({
    example: '64characterlonghextoken...',
    description: 'Token único de 64 caracteres recibido por correo electrónico',
    minLength: 64,
  })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  @MinLength(64, { message: 'Token inválido' })
  token!: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario que se registra',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  fullName!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Contraseña de acceso definida por el usuario',
    minLength: 8,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  password!: string;
}
