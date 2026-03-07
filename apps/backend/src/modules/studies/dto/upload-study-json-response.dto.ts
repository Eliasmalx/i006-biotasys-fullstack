import { ApiProperty } from '@nestjs/swagger';
import { StudyResponseDto } from './study-response.dto';

export class UploadStudyJsonResponseDto {
  @ApiProperty({ example: 'JSON recibido y encolado para procesamiento' })
  message!: string;

  @ApiProperty({ type: StudyResponseDto })
  study!: StudyResponseDto;
}

