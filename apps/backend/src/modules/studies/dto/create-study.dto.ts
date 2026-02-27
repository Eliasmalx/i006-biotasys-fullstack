import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateStudyDto {
  @ApiProperty({
    example: 'PAT-2026-0001',
    description: 'Codigo externo del paciente',
  })
  @IsString()
  @IsNotEmpty()
  patient_code: string;

  @ApiProperty({
    example: 'BIO-2026-AR-00487',
    description: 'Codigo unico del estudio',
  })
  @IsString()
  @IsNotEmpty()
  study_code: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Organizacion a la que pertenece el estudio. Se completa automaticamente desde el token',
  })
  @IsOptional()
  @IsUUID()
  organization_id?: string;
}
