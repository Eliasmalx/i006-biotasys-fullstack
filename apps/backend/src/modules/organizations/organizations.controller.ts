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
  Request,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteAdminDto } from './dto/invite-admin.dto';
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
 * OrganizationsController
 * Scope: /api/organizations/
 * Maneja CRUD de organizaciones y creación de organizaciones con admin
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * POST /api/organizations
   * Crea una nueva organización e invita al administrador (SUPERADMIN only)
   */
  @Post()
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createOrganizationAndInviteAdmin(
    @Request() req: AuthenticatedRequest,
    @Body() dto: InviteAdminDto,
  ): Promise<{ message: string; invitationToken: string }> {
    const token =
      await this.organizationsService.createOrganizationAndInviteAdmin(
        req.user!.userId,
        dto,
      );

    return {
      message: 'Organización creada e invitación enviada',
      invitationToken: token,
    };
  }

  /**
   * GET /api/organizations
   * Lista todas las organizaciones (SUPERADMIN only)
   */
  @Get()
  @Roles(Role.SUPERADMIN)
  findAll() {
    return this.organizationsService.findAll();
  }

  /**
   * GET /api/organizations/:id
   * Obtiene una organización por ID (SUPERADMIN only)
   */
  @Get(':id')
  @Roles(Role.SUPERADMIN)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.findOne(id);
  }

  /**
   * PATCH /api/organizations/:id
   * Actualiza una organización (SUPERADMIN only)
   */
  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, dto);
  }

  /**
   * DELETE /api/organizations/:id
   * Elimina una organización (SUPERADMIN only)
   */
  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.organizationsService.remove(id);
  }
}
