import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request as NestRequest,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
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

import { PatiensService } from './patients.service';
import { CreatePatienDto } from './dto/create-patients.dto';
import { UpdatePatienDto } from './dto/update-patients.dto';
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

@ApiTags('Pacientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROFESSIONAL, Role.LAB_OPERATOR)
@Controller('patients')
export class PatiensController {
  constructor(private readonly patiensService: PatiensService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo paciente en la organizacion' })
  @ApiCreatedResponse({ description: 'Paciente creado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos invalidos' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  async create(
    @NestRequest() req: AuthenticatedRequest,
    @Body() createPatienDto: CreatePatienDto,
  ) {
    return await this.patiensService.create(
      req.user!.userId,
      req.user!.organizationId!,
      createPatienDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pacientes de mi organizacion' })
  @ApiOkResponse({ description: 'Listado de pacientes obtenido correctamente' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  async findAll(@NestRequest() req: AuthenticatedRequest) {
    return await this.patiensService.findAll(req.user!.organizationId!);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener la ficha completa de un paciente' })
  @ApiParam({
    name: 'id',
    description: 'ID del paciente',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({ description: 'Paciente obtenido correctamente' })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  @ApiNotFoundResponse({ description: 'Paciente no encontrado' })
  async findOne(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.patiensService.findOne(id, req.user!.organizationId!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar informacion de un paciente' })
  @ApiParam({
    name: 'id',
    description: 'ID del paciente',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({ description: 'Paciente actualizado correctamente' })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  @ApiNotFoundResponse({ description: 'Paciente no encontrado' })
  async update(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePatienDto: UpdatePatienDto,
  ) {
    return await this.patiensService.update(
      id,
      req.user!.organizationId!,
      updatePatienDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar o eliminar registro de paciente' })
  @ApiParam({
    name: 'id',
    description: 'ID del paciente',
    format: 'uuid',
    type: String,
  })
  @ApiNoContentResponse({
    description: 'Paciente eliminado o desactivado correctamente',
  })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  @ApiNotFoundResponse({ description: 'Paciente no encontrado' })
  async remove(
    @NestRequest() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.patiensService.remove(id, req.user!.organizationId!);
  }
}
