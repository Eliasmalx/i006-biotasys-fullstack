import { ApiProperty } from '@nestjs/swagger';
// 1. Importamos los validadores necesarios
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateSuperadminDto {
  @ApiProperty({ example: 'superadmin@local.test' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @ApiProperty({ example: 'Super Admin', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;
}
