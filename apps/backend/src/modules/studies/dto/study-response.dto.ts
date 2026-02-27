import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudyResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'PAT-2026-0001' })
  patient_code: string;

  @ApiProperty({ example: 'BIO-2026-AR-00487' })
  study_code: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
  })
  status: string;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
  })
  raw_data?: unknown;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
  })
  result_data?: unknown;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'ID de la organizacion asociada al estudio',
  })
  organization_id?: string;

  @ApiProperty()
  created_at: Date;
}
