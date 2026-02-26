import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgStatus } from '../../../common/enums/org-status.enum';

export class OrganizationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Clinica Biotasys' })
  name!: string;

  @ApiProperty({ example: 'B12345678' })
  cif!: string;

  @ApiProperty({ example: 'Calle Falsa 123' })
  address!: string;

  @ApiProperty({ example: 'Madrid' })
  city!: string;

  @ApiProperty({ example: '+34912345678' })
  phone!: string;

  @ApiProperty({ example: 'Gastroenterologia' })
  specialty!: string;

  @ApiProperty({ example: 'H08012345' })
  centerId!: string;

  @ApiProperty({ format: 'uuid' })
  createdBy!: string;

  @ApiProperty({ enum: OrgStatus, example: OrgStatus.ACTIVE })
  status!: OrgStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CreateOrganizationResponseDto {
  @ApiProperty({
    example:
      'Organizacion creada. Se ha enviado una invitacion al correo del administrador.',
  })
  message!: string;

  @ApiPropertyOptional({
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description:
      'Token de invitación (plaintext) para aceptar el alta del admin. Útil para QA/Swagger.',
  })
  invitationToken?: string;
}
