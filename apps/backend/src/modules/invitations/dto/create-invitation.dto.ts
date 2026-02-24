import {
  IsEmail,
  IsIn,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'doctor@biotasys.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '12345678Z' })
  @IsString()
  @IsNotEmpty()
  dni!: string;

  @ApiPropertyOptional({ example: '083412345' })
  @IsString()
  @IsOptional()
  colegiadoNumber?: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR] })
  @IsIn([Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'Rol invalido para invitacion',
  })
  @IsNotEmpty()
  role!: Role.ADMIN | Role.PROFESSIONAL | Role.LAB_OPERATOR;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la organizacion (requerido solo para superadmins)',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
