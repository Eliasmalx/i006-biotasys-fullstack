import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';
import { AiResult } from '../enums/ai-result.enum';
import { PatientSex } from '../enums/patient-sex.enum';
import { ProcessingState } from '../enums/processing-state.enum';
import { StudyStatus } from '../enums/study-status.enum';

export class StudyUserSummaryDto {
  @ApiProperty({ example: '7ec2c8ca-c633-43ea-95dc-02af73ad2018' })
  id!: string;

  @ApiProperty({ example: 'nutri@biotasys.com' })
  email!: string;

  @ApiProperty({ example: 'Elena' })
  firstName!: string;

  @ApiProperty({ example: 'Mendoza' })
  lastName!: string;

  @ApiProperty({ enum: Role, example: Role.NUTRICIONISTA })
  role!: Role;
}

export class StudyResponseDto {
  @ApiProperty({ example: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec' })
  id!: string;

  @ApiProperty({ example: 'BIO-AR-00001' })
  studyCode!: string;

  @ApiProperty({ example: 'PCT-AR-56321' })
  patientCode!: string;

  @ApiProperty({ example: 42 })
  patientAge!: number;

  @ApiProperty({ enum: PatientSex, example: PatientSex.FEMENINO })
  patientSex!: PatientSex;

  @ApiProperty({ example: '2026-03-12' })
  studyDate!: string;

  @ApiProperty({ enum: StudyStatus, example: StudyStatus.EN_ANALISIS })
  status!: StudyStatus;

  @ApiProperty({ enum: AiResult, example: AiResult.SIN_RESULTADO })
  aiResult!: AiResult;

  @ApiProperty({ enum: ProcessingState, example: ProcessingState.PENDING })
  processingState!: ProcessingState;

  @ApiProperty({ required: false })
  processingError?: string | null;

  @ApiProperty({ required: false, example: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf' })
  pdfUrl?: string | null;

  @ApiProperty({ required: false, type: Object })
  normalizedJson?: Record<string, unknown> | null;

  @ApiProperty({ required: false, type: Object })
  rawJson?: Record<string, unknown> | null;

  @ApiProperty({ required: false })
  rejectionReason?: string | null;

  @ApiProperty({ example: 0 })
  processingAttempts!: number;

  @ApiProperty({ required: false })
  lastProcessingAt?: Date | null;

  @ApiProperty({ required: false })
  requestedAt?: Date | null;

  @ApiProperty({ required: false })
  receivedAt?: Date | null;

  @ApiProperty({ required: false })
  analysisStartedAt?: Date | null;

  @ApiProperty({ required: false })
  completedAt?: Date | null;

  @ApiProperty({ required: false })
  rejectedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: StudyUserSummaryDto, required: false })
  nutritionist?: StudyUserSummaryDto;

  @ApiProperty({ type: StudyUserSummaryDto, required: false })
  assignee?: StudyUserSummaryDto;
}

export class PaginatedStudiesResponseDto {
  @ApiProperty({ type: [StudyResponseDto] })
  data!: StudyResponseDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 125 })
  total!: number;

  @ApiProperty({ example: 7 })
  totalPages!: number;
}
