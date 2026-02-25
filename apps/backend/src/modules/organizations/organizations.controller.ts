/* eslint-disable @typescript-eslint/no-unsafe-call */
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
  ApiConflictResponse,
  ApiParam,
} from '@nestjs/swagger';

import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  CreateOrganizationResponseDto,
  OrganizationResponseDto,
} from './dto/organization-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

type AuthenticatedRequest = ExpressRequest & {
  user: {
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
  @ApiOperation({
    summary: 'Crear organizacion e invitar al administrador inicial',
    description: 'Crea la sede y genera una invitacion para el jefe de la misma.',
  })
  @ApiCreatedResponse({
    description: 'La organizacion y la invitacion se han creado con exito.',
    type: CreateOrganizationResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos invalidos o CIF duplicado.' })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  async create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateOrganizationDto,
  ) {
    await this.organizationsService.createOrganizationAndInviteAdmin(
      req.user.userId,
      dto,
    );

    return {
      message:
        'Organizacion creada. Se ha enviado una invitacion al correo del administrador.',
    };
  }

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener el listado de todas las organizaciones' })
  @ApiOkResponse({
    description: 'Listado obtenido correctamente.',
    type: OrganizationResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener detalles de una organizacion especifica' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organizacion',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Detalles de la organizacion encontrados.',
    type: OrganizationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  @ApiNotFoundResponse({ description: 'La organizacion no existe.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar los datos de una organizacion' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organizacion',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Organizacion actualizada correctamente.',
    type: OrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID o cuerpo de la peticion invalido.',
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  @ApiNotFoundResponse({ description: 'La organizacion no existe.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una organizacion del sistema' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organizacion',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Organizacion eliminada con exito.' })
  @ApiUnauthorizedResponse({ description: 'No autenticado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  @ApiNotFoundResponse({ description: 'Organizacion no encontrada.' })
  @ApiConflictResponse({ description: 'La organizacion ya esta inactiva.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.remove(id);
  }
}
