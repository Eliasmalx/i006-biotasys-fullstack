import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { StudyStatus } from '../enums/study-status.enum';
import { AiResult } from '../enums/ai-result.enum';
import { PatientSex } from '../enums/patient-sex.enum';
import { ProcessingState } from '../enums/processing-state.enum';

@Entity('studies')
@Index(['studyCode'], { unique: true })
@Index(['organizationId', 'status'])
@Index(['nutritionistId', 'createdAt'])
@Index(['laboratoryId', 'status'])
export class Study {
  @ApiProperty({ example: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'BIO-AR-00001' })
  @Column({ type: 'varchar', length: 32, unique: true })
  studyCode!: string;

  @ApiProperty({ example: 'd2d3fd1e-6f91-4b2e-b902-8d6578d6a3f1' })
  @Column({ type: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: '7ec2c8ca-c633-43ea-95dc-02af73ad2018' })
  @Column({ type: 'uuid' })
  nutritionistId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'nutritionistId' })
  nutritionist!: User;

  @ApiProperty({ example: 'c5e37fca-fd20-4e59-843d-4ea0dc350907' })
  @Column({ type: 'uuid' })
  laboratoryId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'laboratoryId' })
  laboratory!: User;

  @ApiProperty({ example: 'PCT-AR-56321' })
  @Column({ type: 'varchar', length: 64 })
  patientCode!: string;

  @ApiProperty({ example: 42 })
  @Column({ type: 'int' })
  patientAge!: number;

  @ApiProperty({ enum: PatientSex, example: PatientSex.FEMENINO })
  @Column({ type: 'enum', enum: PatientSex })
  patientSex!: PatientSex;

  @ApiProperty({ example: '2026-03-12' })
  @Column({ type: 'date' })
  studyDate!: string;

  @ApiProperty({ enum: StudyStatus, example: StudyStatus.SOLICITADO })
  @Column({ type: 'enum', enum: StudyStatus })
  status!: StudyStatus;

  @ApiProperty({ enum: AiResult, example: AiResult.SIN_RESULTADO })
  @Column({ type: 'enum', enum: AiResult, default: AiResult.SIN_RESULTADO })
  aiResult!: AiResult;

  @ApiProperty({ required: false, type: Object })
  @Column({ type: 'jsonb', nullable: true })
  rawJson?: Record<string, unknown> | null;

  @ApiProperty({ required: false, type: Object })
  @Column({ type: 'jsonb', nullable: true })
  normalizedJson?: Record<string, unknown> | null;

  @ApiProperty({
    required: false,
    example: 'https://cdn.biotasys.com/report.pdf',
  })
  @Column({ type: 'text', nullable: true })
  pdfUrl?: string | null;

  @ApiProperty({ enum: ProcessingState, example: ProcessingState.PENDING })
  @Column({
    type: 'enum',
    enum: ProcessingState,
    default: ProcessingState.PENDING,
  })
  processingState!: ProcessingState;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  processingError?: string | null;

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  processingAttempts!: number;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastProcessingAt?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  requestedAt?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  receivedAt?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  analysisStartedAt?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
