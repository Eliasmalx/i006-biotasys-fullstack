/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Study } from './study.entity';
import { StudyStatus } from '../enums/study-status.enum';

@Entity('study_status_history')
@Index(['studyId', 'createdAt'])
export class StudyStatusHistory {
  @ApiProperty({ example: '4ed1b3c0-dd5d-4b83-b005-867aa8457af3' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'f37e86f5-95d5-46db-b255-f31a2f0eb2ec' })
  @Column({ type: 'uuid' })
  studyId!: string;

  @ManyToOne(() => Study, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyId' })
  study!: Study;

  @ApiProperty({ enum: StudyStatus, required: false })
  @Column({ type: 'enum', enum: StudyStatus, nullable: true })
  fromStatus?: StudyStatus | null;

  @ApiProperty({ enum: StudyStatus })
  @Column({ type: 'enum', enum: StudyStatus })
  toStatus!: StudyStatus;

  @ApiProperty({
    required: false,
    example: '7ec2c8ca-c633-43ea-95dc-02af73ad2018',
  })
  @Column({ type: 'uuid', nullable: true })
  changedByUserId?: string | null;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;
}
