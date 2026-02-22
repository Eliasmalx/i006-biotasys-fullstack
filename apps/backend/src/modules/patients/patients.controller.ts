import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PatiensService } from './patients.service';
import { CreatePatienDto } from './dto/create-patients.dto';
import { UpdatePatienDto } from './dto/update-patients.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
};

/**
 * PatiensController
 * Scope: /api/patients/
 * Maneja CRUD de pacientes (PROFESSIONAL, LAB_OPERATOR)
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROFESSIONAL, Role.LAB_OPERATOR)
@Controller('patients')
export class PatiensController {
  constructor(private readonly patiensService: PatiensService) {}

  /**
   * POST /api/patients
   * Crear un nuevo paciente
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createPatienDto: CreatePatienDto,
  ) {
    return await this.patiensService.create(
      req.user!.userId,
      req.user!.organizationId!,
      createPatienDto,
    );
  }

  /**
   * GET /api/patients
   * Listar pacientes de la organización
   */
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return await this.patiensService.findAll(req.user!.organizationId!);
  }

  /**
   * GET /api/patients/:id
   * Obtener detalles de un paciente
   */
  @Get(':id')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.patiensService.findOne(id, req.user!.organizationId!);
  }

  /**
   * PATCH /api/patients/:id
   * Actualizar datos de un paciente
   */
  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePatienDto: UpdatePatienDto,
  ) {
    return await this.patiensService.update(
      id,
      req.user!.organizationId!,
      updatePatienDto,
    );
  }

  /**
   * DELETE /api/patients/:id
   * Desactivar un paciente
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.patiensService.remove(id, req.user!.organizationId!);
  }
}
