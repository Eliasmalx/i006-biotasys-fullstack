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
import { ReassignStudyDto } from './dto/reassign-study.dto';
import { RejectStudyDto } from './dto/reject-study.dto';
import {
  PaginatedStudiesResponseDto,
  StudyResponseDto,
} from './dto/study-response.dto';
import { UploadStudyJsonDto } from './dto/upload-study-json.dto';
import { UploadStudyJsonResponseDto } from './dto/upload-study-json-response.dto';
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
  @ApiResponse({
    status: 400,
    description:
      'Usuario asignado invalido (no existe, inactivo, no verificado o sin laboratorio)',
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
      'Guarda el JSON bruto del laboratorio, valida campos clinicos base y encola el envio al backend IA. El envio tecnico saliente se realiza en formato snake_case (study_code, nutricionist_id, patient_id, raw_json, study_date).',
  })
  @ApiBody({ type: UploadStudyJsonDto })
  @ApiResponse({
    status: 201,
    description: 'JSON recibido y job encolado',
    type: UploadStudyJsonResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'JSON invalido o mismatch con datos del estudio (patientCode/patientAge/patientSex/studyDate)',
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

  @Patch(':id/reassign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LABORATORIO)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reasignar estudio',
    description:
      'Permite reasignar un estudio solo en estados SOLICITADO o RECIBIDO a otro usuario del mismo laboratorio',
  })
  @ApiBody({ type: ReassignStudyDto })
  @ApiResponse({
    status: 200,
    description: 'Estudio reasignado',
    type: StudyResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede reasignar en el estado actual',
  })
  @ApiResponse({
    status: 400,
    description: 'Usuario destino invalido o de otro laboratorio',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuario sin permisos o fuera del mismo laboratorio',
  })
  @ApiResponse({ status: 404, description: 'Estudio no encontrado' })
  reassignStudy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReassignStudyDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StudyResponseDto> {
    return this.studiesService.reassignStudy(id, dto, request.user);
  }

  @Post(':id/processing-result')
  @UseGuards(PythonCallbackGuard)
  @ApiHeader({
    name: 'X-API-Key',
    required: true,
    description: 'API key tecnica para callback del backend Python',
  })
  @ApiOperation({
    summary: 'Callback de procesamiento (legado)',
    description:
      'Endpoint tecnico de compatibilidad para callback del backend Python. La integracion principal actual con IA es sincrona.',
  })
  @ApiBody({
    type: ProcessingResultDto,
    examples: {
      camelCase: {
        summary: 'Formato camelCase',
        value: {
          pdfUrl: 'https://cdn.biotasys.com/reports/BIO-AR-56321.pdf',
          normalizedJson: {
            patientSummary: { code: 'PCT-AR-56321' },
            findings: [{ key: 'alpha_diversity', value: 2.31 }],
          },
          aiResult: 'equilibrada',
        },
      },
      snakeCase: {
        summary: 'Formato snake_case',
        value: {
          file_url: 'https://biotasys.com/v1/report_123.pdf',
          study_code: 'BIO-123',
          data: { biomarkers: [] },
          interpretation: { summary: 'ok' },
          aiResult: 'inconclusa',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado de procesamiento aplicado al estudio',
    type: StudyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Payload invalido (faltan pdfUrl/file_url o normalizedJson/payload compatible)',
  })
  @ApiResponse({ status: 401, description: 'API key invalida' })
  handleProcessingResult(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ProcessingResultDto,
  ): Promise<StudyResponseDto> {
    return this.studiesService.handleProcessingResultCallback(id, dto);
  }
}
