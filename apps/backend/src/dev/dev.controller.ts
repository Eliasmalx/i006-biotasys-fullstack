/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

interface CreateSuperadminPayload {
  email: string;
  password: string;
  fullName?: string;
}

/**
 * ⚠️ ENDPOINT SOLO PARA DESARROLLO
 * Crea un superadministrador
 *
 * IMPORTANTE: En producción, este endpoint no debería existir
 * El superadmin debe crearse solo mediante migrations o scripts autorizados
 */
@Controller('dev')
export class DevController {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * POST /api/dev/create-superadmin
   * ⚠️ SOLO EN DESARROLLO
   */
  @Post('create-superadmin')
  @HttpCode(HttpStatus.CREATED)
  async createSuperadmin(@Body() payload: CreateSuperadminPayload): Promise<{
    message: string;
    superadmin: {
      id: string;
      email: string;
      role: string;
    };
    credentials: {
      email: string;
      password: string;
      note: string;
    };
  }> {
    // Validar entrada
    if (!payload.email || !payload.password) {
      throw new Error('Email y password son requeridos');
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    // Verificar que no existe
    const existing = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new Error(`El email ${normalizedEmail} ya está registrado`);
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(payload.password, this.saltRounds);

    // Crear superadmin
    const superadmin = this.userRepository.create({
      email: normalizedEmail,
      fullName: payload.fullName || 'Superadministrador',
      passwordHash,
      role: Role.SUPERADMIN,
      organizationId: undefined,
      status: UserStatus.ACTIVE,
    } as Partial<User>);

    const saved = (await this.userRepository.save(superadmin)) as User;

    return {
      message: '✅ Superadministrador creado exitosamente',
      superadmin: {
        id: saved.id,
        email: saved.email,
        role: saved.role,
      },
      credentials: {
        email: payload.email,
        password: payload.password,
        note: 'Usa estos datos para hacer login en POST /api/auth/login',
      },
    };
  }
}
