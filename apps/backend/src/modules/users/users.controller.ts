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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
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
    description: 'Crea un nuevo usuario y envia email de verificacion',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos requeridos para registrar un usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya esta registrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos para crear usuario',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verificar email',
    description: 'Verifica el email del usuario a partir de un token',
  })
  @ApiQuery({
    name: 'token',
    required: true,
    description: 'Token de verificación de email',
  })
  @ApiResponse({
    status: 201,
    description: 'Email verificado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Token faltante o email ya verificado',
  })
  @ApiResponse({
    status: 404,
    description: 'Token invalido o expirado',
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
    description: 'Retorna la respuesta actual del endpoint de listado',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado obtenido',
    schema: {
      example: 'This action returns all users',
    },
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna la respuesta actual del endpoint por identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    schema: {
      example: 'This action returns a #550e8400-e29b-41d4-a716-446655440000 user',
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'Actualiza datos de un usuario existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Campos a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'El nuevo email ya esta en uso',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos para actualizar usuario',
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
    description: 'Elimina un usuario por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado',
    schema: {
      example: 'This action removes a #550e8400-e29b-41d4-a716-446655440000 user',
    },
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
