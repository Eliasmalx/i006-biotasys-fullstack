import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Clínica Dental Biotasys' })
  @IsString()
  @IsNotEmpty()
  organizationName!: string;

  @ApiProperty({ example: 'admin.clinica@test.com' })
  @IsEmail()
  @IsNotEmpty()
  adminEmail!: string;

  @ApiProperty({ example: 'Juan Perez Admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  adminFullName!: string;

  @ApiProperty({ example: '12345678A' })
  @IsString()
  @IsNotEmpty()
  adminDni!: string; // Añadido para la UI

  @ApiProperty({ example: '080812345' })
  @IsString()
  @IsNotEmpty()
  adminProfessionalId!: string; // Nº de colegiado

  @ApiProperty({ example: 'B12345678' })
  @IsString()
  @IsNotEmpty()
  cif!: string;

  @ApiProperty({ example: 'H08012345' })
  @IsString()
  @IsNotEmpty()
  centerId!: string; // ID de centro

  @ApiProperty({ example: 'Calle Falsa 123' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'Madrid' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: '912345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Gastroenterología' })
  @IsString()
  @IsOptional()
  specialty?: string;
}
