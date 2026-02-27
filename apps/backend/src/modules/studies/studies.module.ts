import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { StudiesService } from './studies.service';
import { StudiesController } from './studies.controller';
import { Study } from './entities/study.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Study]), HttpModule],
  controllers: [StudiesController],
  providers: [StudiesService],
})
export class StudiesModule {}
