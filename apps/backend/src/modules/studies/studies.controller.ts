import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-guards';
import { PythonCallbackGuard } from '../../common/guards/python-callback/python-callback.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { CreateStudyDto } from './dto/create-study.dto';
import { ListStudiesQueryDto } from './dto/list-studies-query.dto';
import { ProcessingResultDto } from './dto/processing-result.dto';
import { RejectStudyDto } from './dto/reject-study.dto';
import {
  PaginatedStudiesResponseDto,
  StudyResponseDto,
} from './dto/study-response.dto';
import { UploadStudyJsonDto } from './dto/upload-study-json.dto';
import { StudiesService } from './studies.service';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: Role;
    email?: string;
  };
};

@ApiTags('Studies')
@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NUTRICIONISTA)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear estudio',
    description:
      'Crea un nuevo estudio para nutricionista y lo deja en estado SOLICITADO',
  })
  @ApiBody({ type: CreateStudyDto })
  @ApiResponse({
    status: 201,
    description: 'Estudio creado exitosamente',
    type: StudyResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Rol no autorizado' })
  createStudy(
    @Body() dto: CreateStudyDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.createStudy(dto, request.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NUTRICIONISTA)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar estudios del nutricionista',
    description:
      'Retorna estudios del nutricionista autenticado con filtros y paginacion',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado',
    type: PaginatedStudiesResponseDto,
  })
  listNutritionistStudies(
    @Query() query: ListStudiesQueryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PaginatedStudiesResponseDto> {
    return this.studiesService.listNutritionistStudies(query, request.user);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar ordenes del laboratorio',
    description:
      'Retorna solo estudios asignados al usuario autenticado en sesion laboratorio',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de ordenes',
    type: PaginatedStudiesResponseDto,
  })
  listLaboratoryOrders(
    @Query() query: ListStudiesQueryDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PaginatedStudiesResponseDto> {
    return this.studiesService.listLaboratoryOrders(query, request.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NUTRICIONISTA, Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Detalle de estudio',
    description:
      'Retorna detalle completo del estudio para su owner nutricionista o usuario asignado',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de estudio',
    type: StudyResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Estudio no encontrado' })
  getStudyById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.getStudyByIdForRole(id, request.user);
  }

  @Patch(':id/receive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Marcar orden como recibida',
    description: 'Transiciona el estudio de SOLICITADO a RECIBIDO',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: StudyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Transicion de estado invalida' })
  markAsReceived(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.markAsReceived(id, request.user);
  }

  @Patch(':id/start-analysis')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Iniciar analisis',
    description: 'Transiciona el estudio de RECIBIDO a EN_ANALISIS',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado',
    type: StudyResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Transicion de estado invalida' })
  markAsInAnalysis(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.markAsInAnalysis(id, request.user);
  }

  @Post(':id/upload-json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cargar JSON de estudio',
    description:
      'Guarda el JSON bruto enviado por laboratorio y encola su procesamiento asincrono en backend Python',
  })
  @ApiBody({ type: UploadStudyJsonDto })
  @ApiResponse({
    status: 201,
    description: 'JSON recibido y job encolado',
    schema: {
      example: {
        message: 'JSON recibido y encolado para procesamiento',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Estado invalido para cargar JSON' })
  uploadStudyRawJson(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UploadStudyJsonDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<{ message: string; study: StudyResponseDto }> {
    return this.studiesService.uploadStudyRawJson(id, dto, request.user);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rechazar estudio',
    description:
      'Rechaza un estudio desde SOLICITADO/RECIBIDO/EN_ANALISIS con motivo obligatorio',
  })
  @ApiBody({ type: RejectStudyDto })
  @ApiResponse({
    status: 200,
    description: 'Estudio rechazado',
    type: StudyResponseDto,
  })
  rejectStudy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RejectStudyDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.rejectStudy(id, dto, request.user);
  }

  @Post(':id/processing-result')
  @UseGuards(PythonCallbackGuard)
  @ApiHeader({
    name: 'X-API-Key',
    required: true,
    description: 'API key tecnica para callback del backend Python',
  })
  @ApiOperation({
    summary: 'Callback de procesamiento',
    description:
      'Endpoint tecnico consumido por backend Python para entregar pdfUrl, normalizedJson y resultado IA',
  })
  @ApiBody({ type: ProcessingResultDto })
  @ApiResponse({
    status: 201,
    description: 'Resultado de procesamiento aplicado al estudio',
    type: StudyResponseDto,
  })
  @ApiResponse({ status: 401, description: 'API key invalida' })
  handleProcessingResult(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ProcessingResultDto,
  ): Promise<StudyResponseDto> {
    return this.studiesService.handleProcessingResultCallback(id, dto);
  }
}
