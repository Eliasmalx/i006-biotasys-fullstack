import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from './../../common/guards/role-guards/roles.guard';
import { Roles } from './../../common/decorators/roles.decorator';
import { Role } from './../../common/enums/role.enum';

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
};

/**
 * UsersController
 * Scope: /api/users/
 * Maneja endpoints para profesionales y lab_operators
 * También maneja CRUD de usuarios por parte de administradores
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/users
   * Listar usuarios de la organización (ADMIN only)
   */
  @Get()
  @Roles(Role.ADMIN)
  async listByOrganization(@Request() req: AuthenticatedRequest) {
    return await this.usersService.listByOrganization(
      req.user!.organizationId!,
    );
  }

  /**
   * GET /api/users/:id
   * Obtener detalles de un usuario (ADMIN, PROFESSIONAL, LAB_OPERATOR)
   */
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    // TODO: Implementar lógica de obtener usuario
    // Por ahora solo endpoint existe
    return { id };
  }

  /**
   * PATCH /api/users/:id
   * Actualizar datos de un usuario (ADMIN only)
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, req.user!.organizationId!, dto);
  }

  /**
   * DELETE /api/users/:id
   * Desactivar un usuario (ADMIN only)
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.usersService.deactivate(id, req.user!.organizationId!);
  }
}
