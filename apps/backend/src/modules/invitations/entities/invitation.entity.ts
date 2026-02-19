import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tokenHash: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  invitedByUserId: string;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
