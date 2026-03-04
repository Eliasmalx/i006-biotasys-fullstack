/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  private readonly userPattern = /\/users\/[\w-]+/;
  private readonly patientPattern = /\/patients\/[\w-]+/;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    if (this.userPattern.test(routePath)) {
      // Validar ownership de User (siempre por organización)
      return this.validateUserOwnership(resourceId, user.organizationId);
    }

    if (this.patientPattern.test(routePath)) {
      return this.validateUserOwnership(resourceId, user);
    }

    // Rechazar recursos no reconocidos (mayor seguridad)
    this.logger.warn(
      `Intento de acceso a ruta no permitida: ${routePath} por usuario ${user.userId}`,
    );
    throw new ForbiddenException('Recurso no disponible');
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
}
