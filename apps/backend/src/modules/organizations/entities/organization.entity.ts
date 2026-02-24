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

  @Column({ unique: true })
  cif!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column({ nullable: true })
  phone!: string; // Teléfono principal

  @Column({ nullable: true })
  specialty!: string; // Especialidad

  @Column({ unique: true, nullable: true })
  centerId!: string; // ID de centro (ej: H08012345)

  @Column({ type: 'uuid' })
  createdBy!: string;

  @Column({ type: 'enum', enum: OrgStatus, default: OrgStatus.ACTIVE })
  status!: OrgStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
