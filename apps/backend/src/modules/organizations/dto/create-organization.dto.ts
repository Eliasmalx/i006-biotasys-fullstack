import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
  Matches,
  ValidateIf,
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

  @ApiProperty({ 
    example: 'Juan Perez', 
    description: 'Nombre completo del admin (mínimo: nombre y apellido separados por espacio)'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Debe contener al menos nombre y apellido (ej: "Juan Perez")' })
  @Matches(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios'
  })
  adminFullName!: string;

  @ApiProperty({ example: '12345678A' })
  @IsString()
  @IsNotEmpty()
  adminDni!: string;

  @ApiProperty({ example: '080812345' })
  @IsString()
  @IsNotEmpty()
  adminProfessionalId!: string;

  @ApiProperty({ example: 'B12345678' })
  @IsString()
  @IsNotEmpty()
  cif!: string;

  @ApiProperty({ example: 'H08012345' })
  @IsString()
  @IsNotEmpty()
  centerId!: string;

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
