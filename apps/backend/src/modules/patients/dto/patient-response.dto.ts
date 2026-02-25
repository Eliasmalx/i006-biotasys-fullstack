import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PatientStatus } from '../../../common/enums/patient-status.enum';

export class PatientListItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Carlos' })
  firstName!: string;

  @ApiProperty({ example: 'Rodriguez' })
  lastName!: string;

  @ApiPropertyOptional({ example: 'carlos@example.com' })
  email?: string;

  @ApiProperty({ enum: PatientStatus, example: PatientStatus.ACTIVE })
  status!: PatientStatus;

  @ApiProperty()
  createdAt!: Date;
}

export class PatientDetailResponseDto extends PatientListItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ format: 'uuid' })
  createdBy!: string;

  @ApiProperty()
  updatedAt!: Date;
}
