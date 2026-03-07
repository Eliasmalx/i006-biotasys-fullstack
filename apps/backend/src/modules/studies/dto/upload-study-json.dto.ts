import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsObject } from 'class-validator';

export class UploadStudyJsonDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      patientCode: 'PCT-AR-56321',
      patientAge: 42,
      patientSex: 'FEMENINO',
      studyDate: '2026-03-07',
      sampleId: 'BIO-AR-56321',
      sequencing: {
        platform: 'Illumina MiSeq',
        readCount: 245000,
      },
    },
    description:
      'JSON bruto del laboratorio. Debe ser objeto no vacio y contener patientCode/patientAge/patientSex/studyDate coincidiendo con el estudio',
  })
  @IsObject()
  @IsNotEmptyObject({}, { message: 'rawJson no puede estar vacio' })
  rawJson!: Record<string, unknown>;
}
