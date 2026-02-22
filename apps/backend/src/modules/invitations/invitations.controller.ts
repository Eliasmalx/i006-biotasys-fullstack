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

import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

type RequestWithUser = Request & {
  user: { userId: string; organizationId?: string };
};

/**
 * Controller para invitaciones
 * Maneja invitaciones de profesionales y lab_operators (por admins)
 * Scope: /api/invitations/
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /api/invitations
   * Invitar un usuario profesional o lab_operator
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
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

  /**
   * GET /api/invitations
   * Listar todas las invitaciones pendientes de la organización
   */
  @Get()
  async list(@Req() req: RequestWithUser) {
    return await this.usersService.listInvitations(req.user.organizationId!);
  }

  /**
   * DELETE /api/invitations/:id
   * Revocar una invitación pendiente
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.usersService.revokeInvitation(id, req.user.organizationId!);
  }

  /**
   * PATCH /api/invitations/:id
   * Actualizar estado de invitación (interno)
   */
  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.update(id, dto);
  }
}
