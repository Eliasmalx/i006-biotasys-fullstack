/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Study } from './study.entity';
import { ProcessingJobStatus } from '../enums/processing-job-status.enum';

@Entity('study_processing_jobs')
@Index(['status', 'runAt'])
export class StudyProcessingJob {
  @ApiProperty({ example: '5928e3ef-5af3-4272-8bf5-bd11d9f6ebe1' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec' })
  @Column({ type: 'uuid' })
  studyId!: string;

  @ManyToOne(() => Study, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyId' })
  study!: Study;

  @ApiProperty({ type: Object })
  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @ApiProperty({ example: 0 })
  @Column({ type: 'int', default: 0 })
  attempt!: number;

  @ApiProperty({
    enum: ProcessingJobStatus,
    example: ProcessingJobStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ProcessingJobStatus,
    default: ProcessingJobStatus.PENDING,
  })
  status!: ProcessingJobStatus;

  @ApiProperty()
  @Column({ type: 'timestamp' })
  runAt!: Date;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  lastError?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
