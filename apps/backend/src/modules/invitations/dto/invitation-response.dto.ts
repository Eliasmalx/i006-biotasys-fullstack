import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '../../../common/enums/invitation-status.enum';
import { Role } from '../../../common/enums/role.enum';

export class InvitationCreateDataDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'BIO-2026-AR-00001' })
  professionalId!: string;

  @ApiProperty({ example: 'doctor@biotasys.com' })
  email!: string;

  @ApiProperty()
  expiresAt!: Date;
}

export class CreateInvitationResponseDto {
  @ApiProperty({
    example:
      'Invitacion enviada. Se ha enviado un correo con los detalles al profesional.',
  })
  message!: string;

  @ApiProperty({ type: InvitationCreateDataDto })
  data!: InvitationCreateDataDto;
}

export class InvitationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'doctor@biotasys.com' })
  email!: string;

  @ApiProperty({ example: 'Juan' })
  firstName!: string;

  @ApiProperty({ example: 'Perez' })
  lastName!: string;

  @ApiProperty({ example: '12345678Z' })
  dni!: string;

  @ApiPropertyOptional({ example: '280812345' })
  colegiadoNumber?: string;

  @ApiProperty({ example: 'BIO-2026-AR-00001' })
  professionalId!: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.PROFESSIONAL, Role.LAB_OPERATOR] })
  role!: Role;

  @ApiProperty({ enum: InvitationStatus })
  status!: InvitationStatus;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty()
  expiresAt!: Date;

  @ApiPropertyOptional()
  acceptedAt?: Date;

  @ApiProperty({ format: 'uuid' })
  invitedBy!: string;

  @ApiProperty()
  createdAt!: Date;
}
