import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('patients')
@Index(['organizationId'])
@Index(['createdBy'])
export class Patien {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'uuid' })
  organizationId!: string; // FK → organizations

  @Column({ type: 'uuid' })
  createdBy!: string; // FK → users (professional o lab_operator)

  @Column({ type: 'varchar', default: 'active' })
  status!: 'active' | 'inactive';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
