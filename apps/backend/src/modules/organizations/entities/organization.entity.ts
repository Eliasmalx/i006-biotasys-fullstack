import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrgStatus } from '../../../common/enums/org-status.enum';

@Entity('organizations')
@Index(['createdBy'])
@Index(['status'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'uuid' })
  createdBy!: string; // FK → users (superadmin quien creó la organización)

  @Column({ type: 'enum', enum: OrgStatus, default: OrgStatus.ACTIVE })
  status!: OrgStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
