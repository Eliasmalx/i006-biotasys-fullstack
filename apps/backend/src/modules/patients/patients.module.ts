import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatiensService } from './patients.service';
import { PatiensController } from './patients.controller';
import { Patien } from './entities/patients.entity';
import { CommonGuardsModule } from '../../common/guards/shared/common-guards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patien]), CommonGuardsModule],
  controllers: [PatiensController],
  providers: [PatiensService],
  exports: [TypeOrmModule, PatiensService],
})
export class PatiensModule {}
