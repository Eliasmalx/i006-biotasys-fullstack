import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  handleRequest<TUser = JwtUser>(
    err: unknown,
    user: TUser | undefined,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      const msg =
        typeof (info as PassportInfo)?.message === 'string'
          ? (info as PassportInfo).message!
          : 'No autenticado';
      throw new UnauthorizedException(msg);
    }
    return user;
  }
}
