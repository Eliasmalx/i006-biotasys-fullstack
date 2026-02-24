import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';
import { Role } from '../../../common/enums/role.enum';

@Entity('invitations')
@Index(['tokenHash']) // Cambiado de 'token' a 'tokenHash' por seguridad
@Index(['organizationId'])
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  dni!: string;

  @Column({ nullable: true })
  colegiadoNumber?: string;

  /**
   * Identificador profesional: BIO-2026-AR-XXXXX
   */
  @Column({ unique: true })
  professionalId!: string;

  @Column({
    type: 'enum',
    enum: [Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR],
  })
  role!: Role;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Column({ type: 'uuid' })
  organizationId!: string;

  /**
   * SEGURIDAD: Guardamos el hash del token, no el token en texto plano
   */
  @Column({ unique: true })
  tokenHash!: string;

  /**
   * CONTROL DE TIEMPO: Para que el link expire en 7 días
   */
  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  /**
   * AUDITORÍA: Quién invitó a este usuario
   */
  @Column({ type: 'uuid' })
  invitedBy!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
