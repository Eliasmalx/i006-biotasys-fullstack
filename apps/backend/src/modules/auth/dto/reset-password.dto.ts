import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...' })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: 'NuevaPassword123!' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword!: string;
}
