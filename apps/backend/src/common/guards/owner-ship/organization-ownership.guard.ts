/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Patien } from '../../../modules/patients/entities/patients.entity';
import { Role } from '../../enums/role.enum';

/**
 * OrganizationOwnershipGuard
 * Valida ownership multinivel según el rol del usuario:
 * - ADMIN: Can access resources pertenecientes a su organización
 * - PROFESSIONAL/LAB_OPERATOR: Can only access recursos que crearon (createdBy)
 *
 * Uso:
 * @Get(':id')
 * @UseGuards(JwtAuthGuard, RolesGuard, OrganizationOwnershipGuard)
 * async findOne(@Param('id') id: string) { ... }
 */
@Injectable()
export class OrganizationOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationOwnershipGuard.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patien)
    private readonly patientRepository: Repository<Patien>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id;
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('No autorizado');
    }

    // Detectar el tipo de recurso por la ruta
    const routePath = request.path;

    if (routePath.includes('/users/')) {
      // Validar ownership de User (siempre por organización)
      return this.validateUserOwnership(resourceId, user.organizationId);
    }

    if (routePath.includes('/patients/')) {
      // Validar ownership de Patient (multinivel: ADMIN → org, PROFESSIONAL/LAB_OPERATOR → createdBy)
      return this.validatePatientOwnership(resourceId, user);
    }

    // Si no pasa las validaciones, permitir (puede ser un recurso nuevo)
    return true;
  }

  private async validateUserOwnership(
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.organizationId !== organizationId) {
      this.logger.warn(
        `Intento de acceso no autorizado: usuario ${userId} no pertenece a org ${organizationId}`,
      );
      // eslint-disable-next-line prettier/prettier
      throw new ForbiddenException(
        'El usuario no pertenece a tu organización',
      );
    }

    return true;
  }

  private async validatePatientOwnership(
    patientId: string,
    user: { userId: string; role: Role; organizationId: string },
  ): Promise<boolean> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // ADMIN: puede acceder a cualquier paciente de su organización
    if (user.role === Role.ADMIN) {
      if (patient.organizationId !== user.organizationId) {
        this.logger.warn(
          `Intento de acceso no autorizado: paciente ${patientId} no pertenece a org ${user.organizationId}`,
        );
        throw new ForbiddenException(
          'El paciente no pertenece a tu organización',
        );
      }
      return true;
    }

    // PROFESSIONAL/LAB_OPERATOR: solo pueden acceder a pacientes que crearon
    if (
      user.role === Role.PROFESSIONAL ||
      user.role === Role.LAB_OPERATOR
    ) {
      if (patient.createdBy !== user.userId) {
        this.logger.warn(
          `Intento de acceso no autorizado: profesional ${user.userId} intenta acceder a paciente ${patientId} creado por ${patient.createdBy}`,
        );
        throw new ForbiddenException(
          'Solo puedes acceder a pacientes que creaste',
        );
      }

      // Validar que el paciente está en la misma organización
      if (patient.organizationId !== user.organizationId) {
        this.logger.warn(
          `Intento de acceso intercomunicación: paciente ${patientId} de org ${patient.organizationId} accedido por usuario de org ${user.organizationId}`,
        );
        throw new ForbiddenException(
          'El paciente no pertenece a tu organización',
        );
      }

      return true;
    }

    // Otros roles no tienen acceso a pacientes
    throw new ForbiddenException(
      'Tu rol no tiene permiso para acceder a pacientes',
    );
  }
}
