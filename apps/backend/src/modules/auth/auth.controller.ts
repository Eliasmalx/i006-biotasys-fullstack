import { Controller, Post, Body, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-guards';
import { Role } from '../../common/enums/role.enum';

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

interface SwitchRoleDto {
  role: Role;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login de usuario',
    description: 'Autentica un usuario con email, contraseña y rol. Retorna JWT access token y refresh token para mantener la sesión.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      ejemplo1: {
        value: {
          email: 'juan@example.com',
          password: 'SecurePass123!',
          role: 'nutricionista',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. Retorna tokens de autenticación y datos del usuario.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email o contraseña incorrectos, o usuario inactivo',
    schema: {
      example: {
        message: 'Email o contraseña incorrectos',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email no verificado o datos de entrada inválidos',
    schema: {
      example: {
        message: 'Tu email aún no ha sido verificado',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Datos de validación inválidos',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refrescar access token',
    description: 'Obtiene un nuevo access token usando un refresh token válido. El refresh token tiene duración de 7 días.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo1: {
        value: {
          refreshToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Access token refrescado exitosamente',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 1800,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o usuario inactivo',
    schema: {
      example: {
        message: 'Refresh token expirado',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token revocado (usuario hizo logout)',
    schema: {
      example: {
        message: 'Refresh token ha sido revocado. Por favor, vuelve a loguear',
      },
    },
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Cerrar sesión (logout)',
    description: 'Revoca el refresh token para terminar la sesión de forma segura',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo1: {
        value: {
          refreshToken: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesion cerrada exitosamente',
      },
    },
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
    summary: 'Cambiar rol de sesión',
    description:
      'Cambia el rol de la sesión actual entre nutricionista y laboratorio. Emite nuevos tokens sin requerir credenciales. Útil para usuarios que tienen múltiples roles.',
  })
  @ApiBody({
    type: 'object',
    required: true,
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['nutricionista', 'laboratorio'],
          example: 'laboratorio',
          description: 'Nuevo rol a usar en la sesión',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Rol de sesión actualizado. Se retornan nuevos tokens.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Rol inválido (no está en lista permitida) o usuario con email no verificado',
    schema: {
      example: {
        message: 'Solo se permite cambiar entre nutricionista y laboratorio',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido, expirado o usuario inactivo',
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

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Solicitar reseteo de contraseña',
    description:
      'Envía un email con un link de reseteo de contraseña al usuario. Por seguridad, no indica si la cuenta existe o no. El token expira en 15 minutos.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      ejemplo1: {
        value: {
          email: 'juan@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitud procesada (retorna el mismo mensaje si el usuario existe o no)',
    schema: {
      example: {
        message:
          'Si el email existe en nuestro sistema, recibirás un enlace para restaurar tu contraseña',
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Email inválido o mal formateado',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Resetear contraseña con token',
    description:
      'Valida el token de reseteo y actualiza la contraseña del usuario. El token expira en 15 minutos.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      ejemplo1: {
        value: {
          token: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6...',
          newPassword: 'NewSecurePass123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña reseteada exitosamente. Inicia sesión con la nueva contraseña.',
    schema: {
      example: {
        message:
          'Tu contraseña ha sido reseteada correctamente. Por favor, inicia sesión',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido, expirado o ya utilizado',
    schema: {
      examples: {
        tokenInvalido: {
          value: { message: 'Token de reseteo inválido' },
        },
        tokenExpirado: {
          value: { message: 'El enlace de reseteo ha expirado. Solicita uno nuevo' },
        },
        yaUtilizado: {
          value: { message: 'Este token ya ha sido utilizado' },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Datos de entrada inválidos (contraseña debe tener mín. 8 caracteres)',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
