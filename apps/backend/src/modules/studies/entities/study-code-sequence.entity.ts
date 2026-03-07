/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('study_code_sequences')
export class StudyCodeSequence {
  @ApiProperty({ example: 'global' })
  @PrimaryColumn({ type: 'varchar', length: 32 })
  key!: string;

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
