import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { StudyStatus } from '../enums/study-status.enum';
import { AiResult } from '../enums/ai-result.enum';

export class ListStudiesQueryDto {
  @ApiPropertyOptional({ example: 'PCT-AR-56321' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'c5e37fca-fd20-4e59-843d-4ea0dc350907' })
  @IsOptional()
  @IsUUID()
  assigneeUserId?: string;

  @ApiPropertyOptional({ enum: StudyStatus, example: StudyStatus.SOLICITADO })
  @IsOptional()
  @IsEnum(StudyStatus)
  status?: StudyStatus;

  @ApiPropertyOptional({ enum: AiResult, example: AiResult.EQUILIBRADA })
  @IsOptional()
  @IsEnum(AiResult)
  aiResult?: AiResult;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

