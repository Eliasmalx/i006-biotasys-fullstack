import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { PatientSex } from '../enums/patient-sex.enum';

export class CreateStudyDto {
  @ApiProperty({ example: 'PCT-AR-56321' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  patientCode!: string;

  @ApiProperty({ example: 42, minimum: 1, maximum: 130 })
  @IsInt()
  @Min(1)
  @Max(130)
  patientAge!: number;

  @ApiProperty({ enum: PatientSex, example: PatientSex.FEMENINO })
  @IsEnum(PatientSex)
  patientSex!: PatientSex;

  @ApiProperty({ example: '2026-03-12' })
  @IsString()
  @IsNotEmpty()
  studyDate!: string;

  @ApiProperty({ example: 'c5e37fca-fd20-4e59-843d-4ea0dc350907' })
  @IsUUID()
  assigneeUserId!: string;
}

