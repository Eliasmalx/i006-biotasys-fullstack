/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('study_code_sequences')
@Index(['organizationId'], { unique: true })
export class StudyCodeSequence {
  @ApiProperty({ example: '9ae2252d-3109-4531-9c84-42e8da0ebd80' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'd2d3fd1e-6f91-4b2e-b902-8d6578d6a3f1' })
  @Column({ type: 'uuid', unique: true })
  organizationId!: string;

  @ApiProperty({ example: 1 })
  @Column({ type: 'int', default: 0 })
  currentValue!: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
