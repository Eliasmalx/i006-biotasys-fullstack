import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

/**
 * DTO para login de usuario
 * El rol se elige en el login, no en el registro
 * Permite que el mismo usuario ingrese con diferentes roles
 */
export class LoginDto {
  @ApiProperty({
    example: 'juan@example.com',
    description: 'Email del usuario',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'nutricionista',
    description: 'Rol a usar en esta sesión (nutricionista o laboratorio)',
    enum: Role,
  })
  @IsEnum(Role, {
    message: 'El rol debe ser nutricionista o laboratorio',
  })
  role!: Role;
}
