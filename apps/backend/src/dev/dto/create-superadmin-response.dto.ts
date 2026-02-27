import { ApiProperty } from '@nestjs/swagger';

class CreatedSuperadminDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'superadmin@local.test' })
  email!: string;

  @ApiProperty({ example: 'superadmin' })
  role!: string;
}

class CreatedSuperadminCredentialsDto {
  @ApiProperty({ example: 'superadmin@local.test' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;

  @ApiProperty({
    example: 'Usa estos datos para hacer login en POST /api/auth/login',
  })
  note!: string;
}

export class CreateSuperadminResponseDto {
  @ApiProperty({ example: 'Superadministrador creado exitosamente' })
  message!: string;

  @ApiProperty({ type: CreatedSuperadminDto })
  superadmin!: CreatedSuperadminDto;

  @ApiProperty({ type: CreatedSuperadminCredentialsDto })
  credentials!: CreatedSuperadminCredentialsDto;
}
