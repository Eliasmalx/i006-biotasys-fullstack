import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../enums/role.enum';
import { OrgStatus } from '../../enums/org-status.enum';
import config from '../../../config/dotenv.config';

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
   * @throws UnauthorizedException si el usuario no existe, está inactivo, su org es inválida, o su rol cambió
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['organization'], // Traer org para validar su estado
    });

    // Validar que el usuario existe
    if (!user) {
      this.logger.warn(`Token inválido: usuario ${payload.sub} no encontrado`);
      throw new UnauthorizedException(
        'Token no válido - usuario no encontrado',
      );
    }

    // Validar que el usuario está activo
    if (!user.isActive) {
      this.logger.warn(`Acceso denegado para usuario inactivo: ${user.id}`);
      throw new UnauthorizedException('Usuario inactivo - acceso denegado');
    }

    // Validar organizationId
    if (!user.organizationId) {
      this.logger.warn(`Usuario sin organización asignada: ${user.id}`);
      throw new UnauthorizedException('Usuario no tiene organización asignada');
    }

    // Validar que la organización está activa (previene acceso a orgs suspendidas/eliminadas)
    if (user.organization && user.organization.status !== OrgStatus.ACTIVE) {
      this.logger.warn(
        `Acceso a organización inactiva: usuario ${user.id} org ${user.organizationId} status ${user.organization.status}`,
      );
      throw new UnauthorizedException(
        'Organización no disponible - acceso denegado',
      );
    }
    // Validar que el rol no ha cambiado (seguridad contra cambios de roles sin reautenticación)
    if (payload.role && payload.role !== user.role) {
      this.logger.warn(
        `Rol cambió para usuario ${user.id}: ${payload.role} → ${user.role}`,
      );
      throw new UnauthorizedException('Rol cambió - por favor reautentícate');
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
