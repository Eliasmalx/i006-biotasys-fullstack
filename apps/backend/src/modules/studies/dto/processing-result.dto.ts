import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ExternalAiResult } from '../enums/ai-result.enum';

export class ProcessingResultDto {
  @ApiPropertyOptional({
    example: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf',
    description: 'Formato actual del callback',
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
    description: 'Formato actual del callback',
  })
  @IsObject()
  @IsOptional()
  normalizedJson?: Record<string, unknown>;

  @ApiProperty({
    enum: ExternalAiResult,
    example: ExternalAiResult.EQUILIBRADA,
  })
  @IsEnum(ExternalAiResult)
  aiResult!: ExternalAiResult;

  @ApiPropertyOptional({
    example: 'BIO-123',
    description: 'Formato IA en snake_case',
  })
  @IsOptional()
  @IsString()
  study_code?: string;

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
    description: 'Formato IA en snake_case',
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
    type: 'object',
    additionalProperties: true,
    example: { modelVersion: 'v1.2.0', processingMs: 1732 },
  })
  @IsOptional()
  @IsObject()
  processingMeta?: Record<string, unknown>;
}
