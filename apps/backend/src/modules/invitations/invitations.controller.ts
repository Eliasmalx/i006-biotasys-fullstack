import {
  Body,
  Controller,
  Param,
  Req,
  Patch,
  Post,
  Get,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

import { InvitationsService } from './invitations.service';
import { UsersService } from '../users/users.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
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
  user: { userId: string; organizationId?: string };
};

@ApiTags('Admin - Invitaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invitar a un nuevo profesional o tecnico' })
  @ApiCreatedResponse({
    description: 'Invitacion enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario invitado exitosamente' },
        invitationToken: { type: 'string', example: 'a1b2c3d4...' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos de invitacion invalidos' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateInvitationDto) {
    const token = await this.usersService.inviteUser(
      req.user.userId,
      req.user.organizationId!,
      dto,
    );

    return {
      message: 'Usuario invitado exitosamente',
      invitationToken: token,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las invitaciones de la clinica' })
  @ApiOkResponse({ description: 'Listado de invitaciones de la organizacion' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  async list(@Req() req: RequestWithUser) {
    return await this.usersService.listInvitations(req.user.organizationId!);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revocar o cancelar una invitacion pendiente' })
  @ApiParam({
    name: 'id',
    description: 'ID de la invitacion',
    format: 'uuid',
    type: String,
  })
  @ApiNoContentResponse({ description: 'Invitacion revocada correctamente' })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  @ApiNotFoundResponse({ description: 'Invitacion no encontrada' })
  async revoke(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.usersService.revokeInvitation(id, req.user.organizationId!);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de invitacion (solo SUPERADMIN)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la invitacion',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({ description: 'Invitacion actualizada correctamente' })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  @ApiNotFoundResponse({ description: 'Invitacion no encontrada' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.update(id, dto);
  }
}
