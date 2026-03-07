import { ApiProperty } from '@nestjs/swagger';

export class LaboratoryOptionDto {
  @ApiProperty({ example: 'c5e37fca-fd20-4e59-843d-4ea0dc350907' })
  userId!: string;

  @ApiProperty({ example: 'BiomeSense' })
  laboratory!: string;

  @ApiProperty({ example: 'Ana Perez' })
  fullName!: string;

  @ApiProperty({ example: 'ana@biotasys.com' })
  email!: string;
}

