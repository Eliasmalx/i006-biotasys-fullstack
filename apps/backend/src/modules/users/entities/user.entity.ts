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
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del usuario (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'doctor@biotasys.com',
    description: 'Correo electrónico único',
  })
  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @ApiProperty({ example: 'María Silvia' })
  @Column()
  firstName!: string;

  @ApiProperty({ example: 'García López' })
  @Column()
  lastName!: string;

  /**
   * Identificación legal del profesional
   */
  @ApiProperty({ example: '12345678Z', description: 'DNI/NIE del usuario' })
  @Index({ unique: true })
  @Column()
  dni!: string;

  /**
   * Número de colegiado (opcional para operarios)
   */
  @ApiProperty({
    example: '280812345',
    required: false,
    description: 'Número de colegiado profesional',
  })
  @Column({ nullable: true })
  colegiadoNumber?: string;

  /**
   * ID interno de Biotasys: BIO-2026-AR-XXXXX
   */
  @ApiProperty({
    example: 'BIO-2026-AR-00001',
    description: 'Identificador interno del sistema',
  })
  @Index({ unique: true })
  @Column()
  professionalId!: string;

  @ApiProperty({ enum: Role, example: Role.PROFESSIONAL })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PROFESSIONAL,
  })
  role!: Role;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ type: 'uuid', nullable: true })
  invitationId?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
