/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

/**
 * OrganizationOwnershipGuard
 * Version sin organizacion: valida ownership por usuario autenticado.
 */
@Injectable()
export class OrganizationOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(OrganizationOwnershipGuard.name);
  private readonly userPattern = /\/users\/[\w-]+/;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const resourceId = request.params.id as string | undefined;
    const user = request.user as { userId?: string } | undefined;

    if (!user?.userId) {
      throw new ForbiddenException('No autorizado');
    }

    const routePath = request.path as string;

    if (this.userPattern.test(routePath)) {
      if (resourceId !== user.userId) {
        this.logger.warn(
          `Acceso no autorizado: user ${user.userId} intento acceder a user ${resourceId}`,
        );
        throw new ForbiddenException('No puedes acceder a este recurso');
      }
      return true;
    }

    this.logger.warn(
      `Intento de acceso a ruta no permitida: ${routePath} por usuario ${user.userId}`,
    );
    throw new ForbiddenException('Recurso no disponible');
  }
}
