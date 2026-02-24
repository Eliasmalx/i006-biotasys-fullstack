import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  /**
   * Identificación legal del profesional
   */
  @Index({ unique: true })
  @Column()
  dni!: string;

  /**
   * Número de colegiado (opcional para operarios)
   */
  @Column({ nullable: true })
  colegiadoNumber?: string;

  /**
   * ID interno de Biotasys: BIO-2026-AR-XXXXX
   */
  @Index({ unique: true })
  @Column()
  professionalId!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PROFESSIONAL,
  })
  role!: Role;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ type: 'uuid', nullable: true })
  invitationId?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
