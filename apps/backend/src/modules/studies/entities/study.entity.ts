import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('studies')
export class Study {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patient_code: string; // El ID externo que el médico/lab ya conocen

  @Column()
  study_code: string; // Ejemplo: BIO-2026-AR-00487

  @Column({ default: 'PENDING' }) // PENDING, PROCESSING, COMPLETED, FAILED
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  raw_data: unknown; // Aquí guardas el JSON caótico del laboratorio

  @Column({ type: 'jsonb', nullable: true })
  result_data: unknown; // Aquí guardas el informe estructurado de la IA

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization; // Para que cada clínica solo vea lo suyo

  @CreateDateColumn()
  created_at: Date;
}
