import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

/**
 * DTO para actualizar una organización
 * Restringido solo a campos editables (sin datos de invitación ni CIF)
 */
export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Clínica Dental Biotasys Actualizada', required: false })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @ApiProperty({ example: 'Calle Falsa 456', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Madrid', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '+34912345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Odontología General', required: false })
  @IsString()
  @IsOptional()
  specialty?: string;
}
