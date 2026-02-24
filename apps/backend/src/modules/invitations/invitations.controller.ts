import {
  Body,
  Controller,
  Param,
  Req,
  Get,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

type RequestWithUser = Request & {
  user: { userId: string; role: Role; organizationId?: string };
};

@ApiTags('Admin - Invitaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva invitación según jerarquía de roles',
  })
  @ApiCreatedResponse({
    description: 'Invitación generada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario invitado exitosamente' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            professionalId: {
              type: 'string',
              example: 'BIO-2026-AR-00001',
            },
            email: { type: 'string', example: 'doctor@biotasys.com' },
            token: { type: 'string', example: 'a1b2c3d4...' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos del formulario inválidos o falta organizationId',
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para invitar a este rol',
  })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateInvitationDto) {
    const requesterRole = req.user.role;
    let targetOrgId: string;

    // Lógica de validación de jerarquía
    if (requesterRole === Role.SUPERADMIN) {
      if (dto.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Como Superadmin solo puedes invitar Administradores',
        );
      }
      if (!dto.organizationId) {
        throw new BadRequestException(
          'Debes indicar el organizationId para el nuevo Admin',
        );
      }
      targetOrgId = dto.organizationId;
    } else {
      if (dto.role === Role.ADMIN) {
        throw new ForbiddenException(
          'No tienes permiso para invitar a otros Administradores',
        );
      }
      if (!req.user.organizationId) {
        throw new BadRequestException(
          'Tu usuario no tiene una organización asignada',
        );
      }
      targetOrgId = req.user.organizationId;
    }

    const result = await this.invitationsService.create(
      dto,
      req.user.userId,
      targetOrgId,
    );

    return {
      message: 'Usuario invitado exitosamente',
      data: {
        id: result.id,
        professionalId: result.professionalId,
        email: result.email,
        token: result.token,
        expiresAt: result.expiresAt,
      },
    };
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar estado de invitación (manual)' })
  @ApiParam({ name: 'id', description: 'ID de la invitación', format: 'uuid' })
  @ApiOkResponse({ description: 'Invitación actualizada' })
  @ApiBadRequestResponse({ description: 'ID o payload inválido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'Solo el Superadmin puede actualizar estados manualmente',
  })
  @ApiNotFoundResponse({ description: 'La invitación no existe' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return await this.invitationsService.update(id, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Listar invitaciones de mi organización' })
  @ApiOkResponse({
    description: 'Listado de invitaciones obtenido correctamente',
  })
  @ApiBadRequestResponse({ description: 'Usuario sin organizacion asignada' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado' })
  async findAll(@Req() req: RequestWithUser) {
    const orgId = req.user.organizationId;
    if (!orgId)
      throw new BadRequestException('No tienes organización asignada');

    return await this.invitationsService.findAllByOrganization(orgId);
  }
}
