import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsObject, IsOptional, IsString } from 'class-validator';

export class UploadStudyJsonDto {
  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: {
      metadata: {
        sample_type: 'stool',
        collection_method: 'home_kit',
      },
      sequencing: {
        platform: 'Illumina MiSeq',
        readCount: 245000,
      },
    },
    description:
      'JSON bruto del laboratorio en formato camelCase. Alternativa compatible a raw_json.',
  })
  @IsObject()
  @IsOptional()
  rawJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: {
      metadata: {
        sample_type: 'stool',
        collection_method: 'home_kit',
      },
      sequencing: {
        platform: 'Illumina MiSeq',
        reads: 512340,
      },
    },
    description:
      'JSON bruto del laboratorio en formato snake_case. Si viene informado, el backend lo guarda y completa el contexto del estudio al enviarlo a IA.',
  })
  @IsObject()
  @IsOptional()
  raw_json?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'BIO-AR-00003',
    description:
      'Opcional. Si viene informado, se valida contra el studyCode del estudio',
  })
  @IsOptional()
  @IsString()
  study_code?: string;

  @ApiPropertyOptional({
    example: '6f5bfae8-7466-44d6-a767-075dfa2abb22',
    description:
      'Opcional. Si viene informado, se valida contra el nutritionistId del estudio',
  })
  @IsOptional()
  @IsString()
  nutricionist_id?: string;

  @ApiPropertyOptional({
    example: 'PCT-AR-60002',
    description:
      'Opcional. Si viene informado, se valida contra el patientCode del estudio',
  })
  @IsOptional()
  @IsString()
  patient_id?: string;

  @ApiPropertyOptional({
    example: '2026-03-10T00:00:00.000Z',
    description:
      'Opcional. Si viene informado, se valida contra la fecha del estudio',
  })
  @IsOptional()
  @IsDateString()
  study_date?: string;
}
