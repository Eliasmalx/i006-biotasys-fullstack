import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@biotasys.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
