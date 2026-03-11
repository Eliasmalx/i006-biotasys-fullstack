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
@Index(['email'], { unique: true })
@Index(['organizationId'])
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del usuario (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico único',
  })
  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @ApiProperty({ example: 'Juan Pérez García' })
  @Column()
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.NUTRICIONISTA })
  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  role!: Role;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive!: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si el email del usuario ha sido verificado',
  })
  @Column({ default: false })
  emailVerified!: boolean;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({
    example: 'Laboratorio Central',
    required: false,
    description: 'Nombre del laboratorio (opcional)',
  })
  @Column({ type: 'varchar', nullable: true })
  laboratory?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
