import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from '../users/dto/accept-invitation.dto';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Controlador de autenticación
 * Rutas:
 * - POST /api/auth/login - Login con email y contraseña
 * - POST /api/auth/accept-invitation - Aceptar invitación y registrarse
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login con email y contraseña
   * Retorna JWT para usar en requests posteriores
   *
   * @param loginDto Email y contraseña
   * @returns {accessToken, user}
   *
   * @example
   * POST /api/auth/login
   * Content-Type: application/json
   * {
   *   "email": "superadmin@example.com",
   *   "password": "password123"
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * Aceptar invitación y crear usuario (admin, professional, lab_operator)
   * El token viene en el email de invitación
   *
   * @param dto Token, nombre completo y contraseña
   * @returns {accessToken, user}
   *
   * @example
   * POST /api/auth/accept-invitation
   * Content-Type: application/json
   * {
   *   "token": "64characterlonghextoken...",
   *   "fullName": "Juan Pérez",
   *   "password": "securePassword123"
   * }
   */
  @Post('accept-invitation')
  @HttpCode(HttpStatus.CREATED)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
  ): Promise<LoginResponse> {
    return this.authService.acceptInvitation(dto);
  }
}
