import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
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
import type { Request as ExpressRequest } from 'express';
import { StudiesService } from './studies.service';
import { CreateStudyDto } from './dto/create-study.dto';
import { UploadRawDto } from './dto/upload-raw.dto';
import { WebhookAiResultDto } from './dto/webhook-ai-result.dto';
import { StudyResponseDto } from './dto/study-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/';
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

@ApiTags('Studies')
@Controller('studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL)
  @ApiOperation({
    summary: 'Crear un nuevo estudio en la organizacion autenticada',
  })
  @ApiCreatedResponse({
    description: 'Estudio creado correctamente',
    type: StudyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo PROFESSIONAL)' })
  create(
    @Body() createStudyDto: CreateStudyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    createStudyDto.organization_id = req.user.organizationId;
    return this.studiesService.create(createStudyDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL, Role.LAB_OPERATOR)
  @ApiOperation({ summary: 'Listar estudios de la organizacion autenticada' })
  @ApiOkResponse({
    description: 'Listado de estudios obtenido correctamente',
    type: StudyResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  findAll(@Request() req: AuthenticatedRequest) {
    return this.studiesService.findAll(req.user.organizationId!);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PROFESSIONAL, Role.LAB_OPERATOR)
  @ApiOperation({ summary: 'Obtener un estudio por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del estudio',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({
    description: 'Estudio obtenido correctamente',
    type: StudyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({
    description: 'No autorizado (solo PROFESSIONAL o LAB_OPERATOR)',
  })
  @ApiNotFoundResponse({ description: 'Estudio no encontrado' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.studiesService.findOne(id);
  }

  @Post(':id/upload-raw')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LAB_OPERATOR)
  @ApiOperation({
    summary: 'Subir datos crudos del laboratorio para un estudio',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del estudio',
    format: 'uuid',
    type: String,
  })
  @ApiOkResponse({
    description: 'Datos crudos registrados y estudio en procesamiento',
    type: StudyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'ID o payload invalido' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'No autorizado (solo LAB_OPERATOR)' })
  @ApiNotFoundResponse({ description: 'Estudio no encontrado' })
  uploadRaw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UploadRawDto,
  ) {
    return this.studiesService.uploadRawData(id, body.raw_data);
  }

  @Post('webhook/ai-result')
  @ApiOperation({
    summary: 'Webhook de IA para registrar el resultado de un estudio',
  })
  @ApiOkResponse({
    description: 'Resultado de IA aplicado al estudio',
    type: StudyResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Payload invalido' })
  @ApiNotFoundResponse({ description: 'Estudio no encontrado' })
  webhook(@Body() body: WebhookAiResultDto) {
    return this.studiesService.updateWithAiResult(body.studyId, body.result);
  }
}
