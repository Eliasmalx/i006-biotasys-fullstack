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
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

/**
 * Tipo extendido para capturar los datos del usuario autenticado desde el token JWT.
 */
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
    summary: 'Crear organización e invitar al administrador inicial',
    description:
      'Crea la sede y genera una invitación para el jefe de la misma.',
  })
  @ApiCreatedResponse({
    description: 'La organización y la invitación se han creado con éxito.',
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos o CIF duplicado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a Superadmins.' })
  async create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() dto: CreateOrganizationDto,
  ) {
    // Es fundamental que el servicio reciba el CreateOrganizationDto completo
    const token =
      await this.organizationsService.createOrganizationAndInviteAdmin(
        req.user.userId,
        dto,
      );

    return {
      message: 'Organización creada e invitación enviada',
      invitationToken: token,
    };
  }

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener el listado de todas las organizaciones' })
  @ApiOkResponse({ description: 'Listado obtenido correctamente.' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Obtener detalles de una organización específica' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organización',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Detalles de la organización encontrados.' })
  @ApiNotFoundResponse({ description: 'La organización no existe.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Actualizar los datos de una organización' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organización',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Organización actualizada correctamente.' })
  @ApiBadRequestResponse({
    description: 'ID o cuerpo de la petición inválido.',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una organización del sistema' })
  @ApiParam({
    name: 'id',
    description: 'UUID de la organización',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Organización eliminada con éxito.' })
  @ApiNotFoundResponse({ description: 'Organización no encontrada.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.remove(id);
  }
}
