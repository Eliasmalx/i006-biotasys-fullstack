import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject } from 'class-validator';

export class UploadRawDto {
  @ApiProperty({
    type: Object,
    additionalProperties: true,
    example: { sample_id: 'SMP-001', reads: [{ gene: 'abc', value: 123 }] },
    description: 'Payload crudo enviado por laboratorio',
  })
  @IsObject()
  @IsNotEmpty()
  raw_data: unknown;
}
