/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { LoginResponseDto } from './dto/login-response.dto';

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

@ApiTags('Autenticacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesion de usuario' })
  @ApiOkResponse({
    description: 'Login exitoso, retorna token y datos del usuario',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Payload invalido' })
  @ApiUnauthorizedResponse({
    description: 'Credenciales invalidas o usuario inactivo',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('accept-invitation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Aceptar invitacion y registrarse en la plataforma',
  })
  @ApiCreatedResponse({
    description: 'Usuario registrado correctamente',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Token invalido/expirado, datos invalidos o email ya registrado',
  })
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
  ): Promise<LoginResponse> {
    return this.authService.acceptInvitation(dto);
  }
}
