import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-guards';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: Role;
    email?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Valida credenciales y retorna JWT + Refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales invalidas o usuario inactivo',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email no verificado',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar access token',
    description: 'Usa refresh token para obtener un nuevo access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refrescado exitosamente',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIs...',
        expiresIn: 1800,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token invalido o expirado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Refresh token revocado',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout (revoca refresh token)',
    description: 'Invalida el refresh token para cerrar sesion',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout exitoso',
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ message: string }> {
    await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);
    return { message: 'Sesion cerrada exitosamente' };
  }

  @Post('switch-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cambiar rol de sesion',
    description:
      'Emite nuevos tokens para cambiar entre nutricionista y laboratorio sin enviar credenciales de nuevo',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Rol de sesion actualizado exitosamente',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Rol invalido o usuario con email no verificado para operar en la plataforma',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token invalido o usuario inactivo/no encontrado',
  })
  async switchRole(
    @Body() switchRoleDto: SwitchRoleDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<LoginResponseDto> {
    return this.authService.switchSessionRole(
      request.user.userId,
      switchRoleDto.role,
    );
  }
}
