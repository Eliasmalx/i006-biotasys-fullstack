import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UploadStudyJsonDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      sampleId: 'BIO-AR-56321',
      metrics: { alphaDiversity: 2.31, betaDiversity: 1.12 },
    },
  })
  @IsObject()
  @IsNotEmpty()
  rawJson!: Record<string, unknown>;
}
