import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import config from '../../../config/dotenv.config';
import { User } from '../../../modules/users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  /**
   * Valida el payload del JWT contra la base de datos
   * @param payload Payload decodificado del JWT
   * @returns Los datos del usuario autenticado
   * @throws UnauthorizedException si el usuario no existe o no está activo
   */
  async validate(payload: JwtPayload) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Token no válido - usuario no encontrado',
      );
    }

    // Este objeto se asigna a req.user
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userId: user.id,
      email: payload.email,
      role: user.role,
    };
  }
}
