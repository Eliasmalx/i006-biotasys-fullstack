import {
  Controller,
  Post,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';

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
    description: 'Credenciales inválidas o usuario inactivo',
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
    description: 'Refresh token inválido o expirado',
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
    description: 'Invalida el refresh token para cerrar sesión',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout exitoso',
  })
  async logout(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ message: string }> {
    await this.authService.revokeRefreshToken(refreshTokenDto.refreshToken);
    return { message: 'Sesión cerrada exitosamente' };
  }
}
