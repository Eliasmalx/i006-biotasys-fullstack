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
import { AdminUsersService } from '../services/admin-users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/role-guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
// import { User } from '../entities/user.entity';
// import { Invitation } from '../../invitations/entities/invitation.entity';
import { InviteUserDto, UpdateUserDto } from '../dto';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
    organizationId?: string;
  };
}

/**
 * Controller para endpoints del administrador de organización
 * Scope: /api/admin/
 * Protegido: Solo usuarios con rol ADMIN
 * Scoped: Cada admin solo puede ver/gestionar usuarios y invitaciones de su propia organización
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * POST /api/admin/invitations
   * Invita un usuario final (professional o lab_operator) a la organización
   */
  @Post('invitations')
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Request() req: AuthenticatedRequest,
    @Body() dto: InviteUserDto,
  ): Promise<{ message: string; invitationToken: string }> {
    const token = await this.adminUsersService.inviteUser(
      req.user!.userId,
      req.user!.organizationId!,
      dto,
    );

    return {
      message: 'Usuario invitado exitosamente',
      invitationToken: token,
    };
  }

  /**
   * GET /api/admin/invitations
   * Lista todas las invitaciones pendientes de la organización del admin
   */
  @Get('invitations')
  async listInvitations(@Request() req: AuthenticatedRequest) {
    return await this.adminUsersService.listInvitations(
      req.user!.organizationId!,
    );
  }

  /**
   * DELETE /api/admin/invitations/:id
   * Revoca una invitación pendiente
   */
  @Delete('invitations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeInvitation(
    @Request() req: AuthenticatedRequest,
    @Param('id') invitationId: string,
  ): Promise<void> {
    await this.adminUsersService.revokeInvitation(
      invitationId,
      req.user!.organizationId!,
    );
  }

  /**
   * GET /api/admin/users
   * Lista todos los usuarios de la organización (professional y lab_operator)
   */
  @Get('users')
  async listUsersInOrganization(@Request() req: AuthenticatedRequest) {
    return await this.adminUsersService.listUsersInOrganization(
      req.user!.organizationId!,
    );
  }

  /**
   * PATCH /api/admin/users/:id
   * Actualiza un usuario de la organización
   */
  @Patch('users/:id')
  async updateUser(
    @Request() req: AuthenticatedRequest,
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.adminUsersService.updateUser(
      userId,
      req.user!.organizationId!,
      dto,
    );
  }

  /**
   * DELETE /api/admin/users/:id
   * Desactiva un usuario de la organización
   */
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateUser(
    @Request() req: AuthenticatedRequest,
    @Param('id') userId: string,
  ): Promise<void> {
    await this.adminUsersService.deactivateUser(
      userId,
      req.user!.organizationId!,
    );
  }
}
