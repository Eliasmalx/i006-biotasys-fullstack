import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({
    enum: Role,
    nullable: true,
    example: null,
    description:
      'Rol persistido en BD (puede ser null). El rol operativo real se selecciona en login',
  })
  role?: Role | null;
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

  @ApiPropertyOptional()
  processingError?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf' })
  pdfUrl?: string | null;

  @ApiPropertyOptional({ type: Object })
  normalizedJson?: Record<string, unknown> | null;

  @ApiPropertyOptional({ type: Object })
  rawJson?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  rejectionReason?: string | null;

  @ApiProperty({ example: 0 })
  processingAttempts!: number;

  @ApiPropertyOptional()
  lastProcessingAt?: Date | null;

  @ApiPropertyOptional()
  requestedAt?: Date | null;

  @ApiPropertyOptional()
  receivedAt?: Date | null;

  @ApiPropertyOptional()
  analysisStartedAt?: Date | null;

  @ApiPropertyOptional()
  completedAt?: Date | null;

  @ApiPropertyOptional()
  rejectedAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({
    type: StudyUserSummaryDto,
    example: {
      id: '7ec2c8ca-c633-43ea-95dc-02af73ad2018',
      email: 'nutri@biotasys.com',
      firstName: 'Elena',
      lastName: 'Mendoza',
      role: Role.NUTRICIONISTA,
    },
  })
  nutritionist?: StudyUserSummaryDto;

  @ApiPropertyOptional({
    type: StudyUserSummaryDto,
    example: {
      id: 'c5e37fca-fd20-4e59-843d-4ea0dc350907',
      email: 'laboperator@biotasys.com',
      firstName: 'Daniela',
      lastName: 'Romero',
      role: Role.LABORATORIO,
    },
  })
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
