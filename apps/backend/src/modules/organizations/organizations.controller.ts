import {
  Body,
  Controller,
  Param,
  Get,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
  Delete,
  HttpCode,
  HttpStatus,
  Request as NestRequest,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
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

import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

type AuthenticatedRequest = ExpressRequest & {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
};

@ApiTags('Superadmin - Organizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear organizacion e invitar administrador' })
  @ApiCreatedResponse({
    description: 'Organizacion creada e invitacion enviada',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Organizacion creada e invitacion enviada',
        },
        invitationToken: { type: 'string', example: 'a1b2c3d4...' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos invalidos' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  async createOrganizationAndInviteAdmin(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: InviteAdminDto,
  ): Promise<{ message: string; invitationToken: string }> {
    const token =
      await this.organizationsService.createOrganizationAndInviteAdmin(
        req.user!.userId,
        dto,
      );

    return {
      message: 'Organizacion creada e invitacion enviada',
      invitationToken: token,
    };
  }

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener lista de todas las organizaciones' })
  @ApiOkResponse({
    description: 'Lista de organizaciones obtenida correctamente',
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener una organizacion por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la organizacion',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({ description: 'Organizacion obtenida correctamente' })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  @ApiNotFoundResponse({ description: 'Organizacion no encontrada' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar datos de una organizacion' })
  @ApiParam({
    name: 'id',
    description: 'ID de la organizacion',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({ description: 'Organizacion actualizada correctamente' })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  @ApiNotFoundResponse({ description: 'Organizacion no encontrada' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una organizacion' })
  @ApiParam({
    name: 'id',
    description: 'ID de la organizacion',
    format: 'uuid',
    type: String,
  })
  @ApiNoContentResponse({ description: 'Organizacion eliminada correctamente' })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo SUPERADMIN)' })
  @ApiNotFoundResponse({ description: 'Organizacion no encontrada' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.remove(id);
  }
}
