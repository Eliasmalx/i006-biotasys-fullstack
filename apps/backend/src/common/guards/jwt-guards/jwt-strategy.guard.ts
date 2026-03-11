/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../enums/role.enum';
import config from '../../../config/dotenv.config';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

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
   * Obtiene el JWT secret con validacion en produccion
   */
  private static getJwtSecret(): string {
    const secret = config.jwtSecret;

    if (!secret || secret === 'default-secret') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'JWT_SECRET no esta definido. Variable de entorno requerida en produccion.',
        );
      }
    }

    return secret;
  }

  /**
   * Valida el payload del JWT contra la base de datos
   * @param payload Payload decodificado del JWT
   * @returns Los datos del usuario autenticado con los permisos actualizados
   * @throws UnauthorizedException si el usuario no existe, esta inactivo, o su rol cambio
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      this.logger.warn(`Token invalido: usuario ${payload.sub} no encontrado`);
      throw new UnauthorizedException(
        'Token no valido - usuario no encontrado',
      );
    }

    if (!user.isActive) {
      this.logger.warn(`Acceso denegado para usuario inactivo: ${user.id}`);
      throw new UnauthorizedException('Usuario inactivo - acceso denegado');
    }

    if (payload.role && payload.role !== user.role) {
      this.logger.warn(
        `Rol cambio para usuario ${user.id}: ${payload.role} -> ${user.role}`,
      );
      throw new UnauthorizedException('Rol cambio - por favor reautenticate');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
