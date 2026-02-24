import { ApiProperty } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ example: 'uuid-123-456' })
  id!: string;

  @ApiProperty({ example: 'superadmin@biotasys.com' })
  email!: string;

  @ApiProperty({ example: 'Mi Superadmin' })
  fullName!: string;

  @ApiProperty({ example: 'superadmin' })
  role!: string;

  @ApiProperty({ example: 'uuid-org-789', required: false })
  organizationId?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT para autenticar las siguientes peticiones',
  })
  accessToken!: string;

  @ApiProperty({ type: UserResponse })
  user!: UserResponse;
}
