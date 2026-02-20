import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';

@Entity('invitations')
@Index(['email'])
@Index(['organizationId'])
@Index(['invitedBy'])
@Index(['status'])
@Index(['expiresAt'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  tokenHash!: string; // Hash del token (almacenado para seguridad)

  @Column()
  email!: string;

  @Column({ type: 'enum', enum: Role })
  role!: Role;

  @Column({ type: 'uuid' })
  organizationId!: string; // FK → organizations

  @Column({ type: 'uuid' })
  invitedBy!: string; // FK → users (quien invitó)

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
