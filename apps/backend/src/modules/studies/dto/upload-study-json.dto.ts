import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsObject } from 'class-validator';

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
  @IsNotEmptyObject({}, { message: 'rawJson no puede estar vacio' })
  rawJson!: Record<string, unknown>;
}
