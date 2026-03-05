import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
import { ExternalAiResult } from '../enums/ai-result.enum';

export class ProcessingResultDto {
  @ApiProperty({ example: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  pdfUrl!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      patientSummary: { code: 'PCT-AR-56321' },
      findings: [{ key: 'alpha_diversity', value: 2.31 }],
    },
  })
  @IsObject()
  @IsNotEmpty()
  normalizedJson!: Record<string, unknown>;

  @ApiProperty({
    enum: ExternalAiResult,
    example: ExternalAiResult.EQUILIBRADA,
  })
  @IsEnum(ExternalAiResult)
  aiResult!: ExternalAiResult;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    example: { modelVersion: 'v1.2.0', processingMs: 1732 },
  })
  @IsOptional()
  @IsObject()
  processingMeta?: Record<string, unknown>;
}
