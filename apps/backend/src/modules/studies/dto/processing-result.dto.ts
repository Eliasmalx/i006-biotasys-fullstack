import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class ProcessingResultDto {
  @ApiPropertyOptional({
    example: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf',
    description: 'Formato actual del callback (camelCase). Requerido si no se envia file_url',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @IsOptional()
  pdfUrl?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: {
      patientSummary: { code: 'PCT-AR-56321' },
      findings: [{ key: 'alpha_diversity', value: 2.31 }],
    },
    description:
      'Formato actual del callback (camelCase). Requerido si no se envia payload IA en snake_case',
  })
  @IsObject()
  @IsOptional()
  normalizedJson?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec',
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsString()
  study_id?: string;

  @ApiPropertyOptional({
    example: 'BIO-123',
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsString()
  study_code?: string;

  @ApiPropertyOptional({
    example: '7ec2c8ca-c633-43ea-95dc-02af73ad2018',
    description:
      'Formato IA en snake_case. Opcional y redundante; si viene, se valida contra el estudio',
  })
  @IsOptional()
  @IsString()
  nutricionist_id?: string;

  @ApiPropertyOptional({
    example: 'PCT-AR-56321',
    description:
      'Formato IA en snake_case. Opcional y redundante; si viene, se valida contra el estudio',
  })
  @IsOptional()
  @IsString()
  patient_id?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { id: 23, name: 'Dr. Smith' },
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsObject()
  nutricionist?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { id: 'PAT-118', sex: 'M', age: 30 },
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsObject()
  patient?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { biomarkers: [] },
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { conclusion: '...' },
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsObject()
  interpretation?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'https://biotasys.com/v1/report_123.pdf',
    description: 'Formato IA en snake_case. Requerido si no se envia pdfUrl',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  file_url?: string;

  @ApiPropertyOptional({
    example: '2026-03-06T15:30:00Z',
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsDateString()
  study_date?: string;

  @ApiPropertyOptional({
    example: '2026-03-06T16:26:04.105367Z',
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsDateString()
  report_date?: string;

  @ApiPropertyOptional({
    example: '2026-03-06T16:26:04.105367Z',
    description:
      'Formato IA en snake_case. Alias aceptado de report_date; se normaliza internamente',
  })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { modelVersion: 'v1.2.0', processingMs: 1732 },
  })
  @IsOptional()
  @IsObject()
  processingMeta?: Record<string, unknown>;
}
