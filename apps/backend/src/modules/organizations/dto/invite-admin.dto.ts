import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una organización e invitar al administrador
 * POST /api/organizations
 */
export class InviteAdminDto {
  @ApiProperty({
    example: 'Clínica Central Biotasys',
    description: 'Nombre de la nueva organización o clínica',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la organización es requerido' })
  organizationName!: string;

  @ApiProperty({
    example: 'admin.clinica@email.com',
    description: 'Email del futuro administrador de la organización',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email del administrador es requerido' })
  adminEmail!: string;

  @ApiProperty({
    example: 'Dr. Alberto Pérez',
    description: 'Nombre completo del administrador',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del administrador es requerido' })
  @MinLength(3)
  adminFullName!: string;
}
