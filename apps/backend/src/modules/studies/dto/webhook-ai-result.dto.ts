import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class WebhookAiResultDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID del estudio procesado por el servicio de IA',
  })
  @IsUUID()
  studyId: string;

  @ApiProperty({
    type: Object,
    additionalProperties: true,
    example: { summary: 'Informe generado', score: 0.93 },
    description: 'Resultado estructurado de la IA',
  })
  @IsObject()
  @IsNotEmpty()
  result: unknown;
}
