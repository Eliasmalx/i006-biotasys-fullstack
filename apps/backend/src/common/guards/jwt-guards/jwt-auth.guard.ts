/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';

type JwtUser = {
  userId: string;
  email: string;
  role: string;
  organizationId?: string | null;
};

type PassportInfo = { message?: string };

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = JwtUser>(
    err: unknown,
    user: TUser | undefined,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const msg =
        typeof (info as PassportInfo)?.message === 'string'
          ? (info as PassportInfo).message!
          : 'Token inválido o expirado';

      // Auditoría de intento fallido
      const request = context.switchToHttp().getRequest();
      this.logger.warn(
        `Autenticación fallida: ${msg} | IP: ${request.ip} | Path: ${request.path}`,
      );

      throw new UnauthorizedException(msg);
    }

    // Validar que organizationId esté presente (requerido para ownership guards)
    const typedUser = user as unknown as JwtUser;
    if (!typedUser.organizationId) {
      this.logger.warn(
        `Usuario autenticado sin organizationId: ${typedUser.userId}`,
      );
      throw new UnauthorizedException('Usuario no tiene organización asignada');
    }

    return user;
  }
}
