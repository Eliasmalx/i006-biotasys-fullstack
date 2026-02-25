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
  CreateInvitationResponseDto,
  InvitationResponseDto,
} from './dto/invitation-response.dto';
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
import { InvitationStatus } from '../../common/enums/invitation-status.enum';

type RequestWithUser = Request & {
  user: { userId: string; role: Role; organizationId?: string };
};

@ApiTags('Admin - Invitaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  private toInvitationResponse(invitation: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dni: string;
    colegiadoNumber?: string;
    professionalId: string;
    role: Role;
    status: InvitationStatus;
    organizationId: string;
    expiresAt: Date;
    acceptedAt?: Date;
    invitedBy: string;
    createdAt: Date;
  }): InvitationResponseDto {
    return {
      id: invitation.id,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      dni: invitation.dni,
      colegiadoNumber: invitation.colegiadoNumber,
      professionalId: invitation.professionalId,
      role: invitation.role,
      status: invitation.status,
      organizationId: invitation.organizationId,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      invitedBy: invitation.invitedBy,
      createdAt: invitation.createdAt,
    };
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva invitacion segun jerarquia de roles',
  })
  @ApiCreatedResponse({
    description: 'Invitacion generada exitosamente',
    type: CreateInvitationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos del formulario invalidos o falta organizationId',
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No tiene permisos para invitar a este rol',
  })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateInvitationDto) {
    const requesterRole = req.user.role;
    let targetOrgId: string;

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
          'Tu usuario no tiene una organizacion asignada',
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
      message:
        'Invitacion enviada. Se ha enviado un correo con los detalles al profesional.',
      data: {
        id: result.id,
        professionalId: result.professionalId,
        email: result.email,
        expiresAt: result.expiresAt,
      },
    };
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar estado de invitacion (manual)' })
  @ApiParam({ name: 'id', description: 'ID de la invitacion', format: 'uuid' })
  @ApiOkResponse({
    description: 'Invitacion actualizada',
    type: InvitationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'Solo el Superadmin puede actualizar estados manualmente',
  })
  @ApiNotFoundResponse({ description: 'La invitacion no existe' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    const updated = await this.invitationsService.update(id, dto);
    return this.toInvitationResponse(updated);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiOperation({ summary: 'Listar invitaciones de mi organizacion' })
  @ApiOkResponse({
    description: 'Listado de invitaciones obtenido correctamente',
    type: InvitationResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Usuario sin organizacion asignada' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado' })
  async findAll(@Req() req: RequestWithUser) {
    const orgId = req.user.organizationId;
    if (!orgId) {
      throw new BadRequestException('No tienes organizacion asignada');
    }

    const invitations = await this.invitationsService.findAllByOrganization(orgId);
    return invitations.map((invitation) => this.toInvitationResponse(invitation));
  }
}
