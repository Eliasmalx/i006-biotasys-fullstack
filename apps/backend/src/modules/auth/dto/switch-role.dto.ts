import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class SwitchRoleDto {
  @ApiProperty({
    example: Role.LABORATORIO,
    description: 'Rol objetivo para la sesion actual',
    enum: [Role.NUTRICIONISTA, Role.LABORATORIO],
  })
  @IsEnum(Role, {
    message: 'El rol debe ser nutricionista o laboratorio',
  })
  role!: Role;
}
