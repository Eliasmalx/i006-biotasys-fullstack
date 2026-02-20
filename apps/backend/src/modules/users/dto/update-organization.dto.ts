import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OrgStatus } from '../../../common/enums/org-status.enum';

/**
 * DTO para actualizar organización
 * PATCH /api/superadmin/organizations/:id
 */
export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsEnum(OrgStatus, {
    message: `El estado debe ser uno de: ${Object.values(OrgStatus).join(', ')}`,
  })
  @IsOptional()
  status?: OrgStatus;
}
