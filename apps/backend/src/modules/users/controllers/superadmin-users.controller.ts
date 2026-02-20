import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SuperadminUsersService } from '../services/superadmin-users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/role-guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { Organization } from '../../organizations/entities/organization.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
}

/**
 * Controller para endpoints del superadministrador
 * Scope: /api/superadmin/
 * Protegido: Solo usuarios con rol SUPERADMIN
 */
@Controller('superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class SuperadminUsersController {
  constructor(
    private readonly superadminUsersService: SuperadminUsersService,
  ) {}

  /**
   * POST /api/superadmin/organizations
   * Crea una nueva organización e invita al administrador
   */
  @Post('organizations')
  @HttpCode(HttpStatus.CREATED)
  async createOrganizationAndInviteAdmin(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateOrganizationDto,
  ): Promise<{ message: string; invitationToken: string }> {
    const token =
      await this.superadminUsersService.createOrganizationAndInviteAdmin(
        req.user!.userId,
        dto,
      );

    return {
      message: 'Organización creada e invitación enviada',
      invitationToken: token,
    };
  }

  /**
   * GET /api/superadmin/organizations
   * Lista todas las organizaciones
   */
  @Get('organizations')
  async listOrganizations(): Promise<Organization[]> {
    return this.superadminUsersService.listOrganizations();
  }

  /**
   * GET /api/superadmin/organizations/:id
   * Obtiene una organización por ID
   */
  @Get('organizations/:id')
  async getOrganizationById(
    @Param('id') organizationId: string,
  ): Promise<Organization> {
    return this.superadminUsersService.getOrganizationById(organizationId);
  }

  /**
   * PATCH /api/superadmin/organizations/:id
   * Actualiza una organización (nombre, estado)
   */
  @Patch('organizations/:id')
  async updateOrganization(
    @Param('id') organizationId: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<Organization> {
    return this.superadminUsersService.updateOrganization(organizationId, dto);
  }

  /**
   * GET /api/superadmin/invitations
   * Lista todas las invitaciones pendientes de admins
   */
  @Get('invitations')
  async listAdminInvitations(): Promise<Invitation[]> {
    return this.superadminUsersService.listAdminInvitations();
  }

  /**
   * DELETE /api/superadmin/invitations/:id
   * Revoca una invitación pendiente
   */
  @Delete('invitations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeInvitation(@Param('id') invitationId: string): Promise<void> {
    await this.superadminUsersService.revokeInvitation(invitationId);
  }
}
