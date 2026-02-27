import {
  IsEmail,
  IsIn,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
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

  @ApiPropertyOptional({
    example: '083412345',
    description:
      'Número de colegiado (opcional en DTO, pero requerido por backend para PROFESSIONAL y LAB_OPERATOR)',
  })
  @IsString()
  @IsOptional()
  @MinLength(6, {
    message: 'Número de colegiado debe tener al menos 6 caracteres',
  })
  @MaxLength(12, {
    message: 'Número de colegiado no puede exceder 12 caracteres',
  })
  @Matches(/^[0-9a-zA-Z]+$/, {
    message: 'Número de colegiado solo puede contener números y letras',
  })
  colegiadoNumber?: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR] })
  @IsIn([Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR], {
    message: 'Rol invalido para invitacion',
  })
  @IsNotEmpty()
  role!: Role.ADMIN | Role.PROFESSIONAL | Role.LAB_OPERATOR;

  @ApiPropertyOptional({
    example: '45ca04c7-2346-46b4-83b5-8d65b092b2b2',
    description:
      '⚠️ Condicional: SOLO se usa cuando el solicitante es SUPERADMIN y el rol a invitar es ADMIN. ' +
      'Si el solicitante es ADMIN, este campo se IGNORA y se usa organizationId del JWT.',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
