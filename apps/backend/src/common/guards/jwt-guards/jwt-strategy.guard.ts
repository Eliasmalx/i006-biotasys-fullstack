import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import config from '../../../config/dotenv.config';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../enums/role.enum';
import { UserStatus } from '../../enums/user-status.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  organizationId?: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  organizationId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JwtStrategy.getJwtSecret(),
    });
  }

  /**
   * Obtiene el JWT secret con validación en producción
   */
  private static getJwtSecret(): string {
    const secret = config.jwtSecret;

    if (!secret || secret === 'default-secret') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'JWT_SECRET no está definido. Variable de entorno requerida en producción.',
        );
      }
    }

    return secret;
  }

  /**
   * Valida el payload del JWT contra la base de datos
   * @param payload Payload decodificado del JWT
   * @returns Los datos del usuario autenticado con los permisos actualizados
   * @throws UnauthorizedException si el usuario no existe, está inactivo o su rol cambió
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    // Validar que el usuario existe
    if (!user) {
      throw new UnauthorizedException(
        'Token no válido - usuario no encontrado',
      );
    }

    // Validar que el usuario está activo
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Usuario inactivo - acceso denegado',
      );
    }

    // Validar que el rol no ha cambiado (seguridad contra cambios de roles sin reautenticación)
    if (payload.role && payload.role !== user.role) {
      throw new UnauthorizedException(
        'Rol cambió - por favor reautentícate',
      );
    }

    // Retorna los datos del usuario autenticado
    // Este objeto se asigna a req.user en el contexto de la request
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
  }
}
