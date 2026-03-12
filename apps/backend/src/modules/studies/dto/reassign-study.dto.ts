import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReassignStudyDto {
  @ApiProperty({ example: 'c5e37fca-fd20-4e59-843d-4ea0dc350907' })
  @IsUUID()
  assigneeUserId!: string;
}

