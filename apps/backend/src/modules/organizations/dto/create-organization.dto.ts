import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { OrgStatus } from '../../../common/enums/org-status.enum';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsEnum(OrgStatus)
  status?: OrgStatus;
}
