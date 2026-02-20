import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear una nueva organización e invitar administrador
 * POST /api/superadmin/organizations
 */
export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la organización es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  organizationName!: string;

  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email del administrador es requerido' })
  adminEmail!: string;
}
