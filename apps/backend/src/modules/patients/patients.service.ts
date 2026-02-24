/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patien } from './entities/patients.entity';
import { CreatePatienDto } from './dto/create-patients.dto';
import { UpdatePatienDto } from './dto/update-patients.dto';
import { PatientStatus } from '../../common/enums/patient-status.enum';

/**
 * PatiensService
 * Gestiona pacientes creados por profesionales y lab_operators
 */
@Injectable()
export class PatiensService {
  private readonly logger = new Logger(PatiensService.name);

  constructor(
    @InjectRepository(Patien)
    private readonly patientRepository: Repository<Patien>,
  ) {}

  /**
   * Crear un nuevo paciente
   * @param userId ID del usuario que crea el paciente (professional o lab_operator)
   * @param organizationId ID de la organización
   * @param dto Datos del paciente
   * @returns Paciente creado
   */
  async create(userId: string, organizationId: string, dto: CreatePatienDto) {
    if (!userId || !organizationId) {
      throw new BadRequestException('userId y organizationId son requeridos');
    }

    const patient = this.patientRepository.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email ? dto.email.toLowerCase().trim() : undefined,
      organizationId,
      createdBy: userId,
      status: PatientStatus.ACTIVE,
    });

    const saved = await this.patientRepository.save(patient);
    this.logger.log(
      `Paciente creado: ${saved.firstName} ${saved.lastName} en org ${organizationId}`,
    );

    return saved;
  }

  /**
   * Listar todos los pacientes de una organización
   * @param organizationId ID de la organización
   * @returns Lista de pacientes
   */
  async findAll(organizationId: string) {
    const patients = await this.patientRepository.find({
      where: { organizationId },
      select: ['id', 'firstName', 'lastName', 'email', 'status', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return patients;
  }

  /**
   * Obtener un paciente por ID
   * @param id ID del paciente
   * @param organizationId ID de la organización (para validar permisos)
   * @returns Datos del paciente
   */
  async findOne(id: string, organizationId: string) {
    const patient = await this.patientRepository.findOne({
      where: { id, organizationId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return patient;
  }

  /**
   * Actualizar datos de un paciente
   * @param id ID del paciente
   * @param organizationId ID de la organización
   * @param userId ID del usuario que actualiza (para auditoría)
   * @param dto Datos a actualizar
   * @returns Paciente actualizado
   */
  async update(
    id: string,
    organizationId: string,
    userId: string,
    dto: UpdatePatienDto,
  ) {
    const patient = await this.patientRepository.findOne({
      where: { id, organizationId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    if (dto.firstName) {
      patient.firstName = dto.firstName.trim();
    }
    if (dto.lastName) {
      patient.lastName = dto.lastName.trim();
    }
    if (dto.email !== undefined) {
      patient.email = dto.email ? dto.email.toLowerCase().trim() : undefined;
    }

    const saved = await this.patientRepository.save(patient);
    this.logger.log(`Paciente actualizado: ${saved.id} por usuario ${userId}`);

    return saved;
  }

  /**
   * Desactivar un paciente
   * @param id ID del paciente
   * @param organizationId ID de la organización
   * @param userId ID del usuario que desactiva (para auditoría)
   */
  async remove(
    id: string,
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: { id, organizationId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    if (patient.status === PatientStatus.INACTIVE) {
      throw new BadRequestException('Paciente ya está inactivo');
    }

    patient.status = PatientStatus.INACTIVE;
    await this.patientRepository.save(patient);
    this.logger.log(`Paciente desactivado: ${id} por usuario ${userId}`);
  }
}
