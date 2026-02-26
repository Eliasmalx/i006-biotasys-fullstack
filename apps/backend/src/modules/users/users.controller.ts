import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request as NestRequest,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserDetailResponseDto,
  UserListItemResponseDto,
} from './dto/user-response.dto';
import { JwtAuthGuard } from './../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from './../../common/guards/role-guards/roles.guard';
import { OrganizationOwnershipGuard } from '../../common/guards/owner-ship/organization-ownership.guard';
import { Roles } from './../../common/decorators/roles.decorator';
import { Role } from './../../common/enums/role.enum';

type AuthenticatedRequest = ExpressRequest & {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
};

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios de la organizacion (solo ADMIN)' })
  @ApiOkResponse({
    description: 'Listado de usuarios obtenido correctamente',
    type: UserListItemResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  async listByOrganization(@NestRequest() req: AuthenticatedRequest) {
    return await this.usersService.listByOrganization(
      req.user!.organizationId!,
    );
  }

  @Get(':id')
  @UseGuards(OrganizationOwnershipGuard)
  @ApiOperation({ summary: 'Obtener detalles de un usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({
    description: 'Usuario obtenido correctamente',
    type: UserDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async findOne(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const me = req.user!;
    // ✅ FIX: si NO es admin, solo puede pedir su propio id
    if (me.role !== Role.ADMIN && me.userId !== id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }

    return await this.usersService.findOne(id, me.organizationId!);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(OrganizationOwnershipGuard)
  @ApiOperation({ summary: 'Actualizar datos de un usuario (solo ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({
    description: 'Usuario actualizado correctamente',
    type: UserDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async update(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, req.user!.organizationId!, dto);
  }
  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  @UseGuards(OrganizationOwnershipGuard)
  @ApiOperation({ summary: 'Reactivar un usuario (solo ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({
    description: 'Usuario reactivado correctamente',
    type: UserDetailResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async activate(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.usersService.activate(id, req.user!.organizationId!);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(OrganizationOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar un usuario (solo ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    format: 'uuid',
    type: String,
  })
  @ApiNoContentResponse({ description: 'Usuario desactivado correctamente' })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo ADMIN)' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async deactivate(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.usersService.deactivate(id, req.user!.organizationId!);
  }
}
