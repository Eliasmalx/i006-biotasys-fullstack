/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../modules/users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateSuperadminDto } from './dto/create-superadmin.dto';

@ApiTags('Dev')
@Controller('dev')
export class DevController {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private splitFullName(fullName?: string): {
    firstName: string;
    lastName: string;
  } {
    const normalized = (fullName || 'Superadministrador')
      .trim()
      .replace(/\s+/g, ' ');
    const [firstName, ...rest] = normalized.split(' ');

    return {
      firstName: firstName || 'Superadministrador',
      lastName: rest.join(' ') || 'Biotasys',
    };
  }

  private buildDevProfessionalId(): string {
    const year = new Date().getFullYear();
    const suffix = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0');
    return `BIO-${year}-DEV-${suffix}`;
  }

  @Post('create-superadmin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear superadmin de desarrollo (solo entorno dev)',
  })
  @ApiBody({ type: CreateSuperadminDto })
  @ApiCreatedResponse({ description: 'Superadministrador creado exitosamente' })
  @ApiBadRequestResponse({
    description: 'Email/password faltantes o email repetido',
  })
  async createSuperadmin(@Body() payload: CreateSuperadminDto): Promise<{
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
    if (!payload.email || !payload.password) {
      throw new BadRequestException('Email y password son requeridos');
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    const existing = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException(
        `El email ${normalizedEmail} ya esta registrado`,
      );
    }

    const { firstName, lastName } = this.splitFullName(payload.fullName);
    const hashedPassword = await bcrypt.hash(payload.password, this.saltRounds);
    const now = Date.now().toString();

    const superadmin = this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      dni: `DEV-${now}`,
      professionalId: this.buildDevProfessionalId(),
      role: Role.SUPERADMIN,
      isActive: true,
      organizationId: undefined,
      colegiadoNumber: undefined,
      invitationId: undefined,
    });

    const saved = await this.userRepository.save(superadmin);

    return {
      message: 'Superadministrador creado exitosamente',
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
