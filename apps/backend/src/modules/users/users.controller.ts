/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear usuario',
    description: 'Registra un nuevo usuario y envía email de verificación',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Verifica el email del usuario usando un token',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token de verificación de email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente',
    type: UserResponseDto,
  })
  verifyEmail(@Query('token') token?: string): Promise<UserResponseDto> {
    if (!token) {
      throw new BadRequestException('Token es requerido');
    }
    return this.usersService.verifyEmail(token);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene la lista de todos los usuarios registrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios',
    type: [UserResponseDto],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario',
    description: 'Obtiene los detalles de un usuario específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza los datos de un usuario existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
