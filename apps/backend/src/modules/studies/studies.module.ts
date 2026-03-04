import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Study } from './entities/study.entity';
import { StudyCodeSequence } from './entities/study-code-sequence.entity';
import { StudyProcessingJob } from './entities/study-processing-job.entity';
import { StudyStatusHistory } from './entities/study-status-history.entity';
import { StudiesController } from './studies.controller';
import { StudiesService } from './studies.service';
import { RolesGuard } from '../../common/guards/role-guards/roles.guard';
import { PythonCallbackGuard } from '../../common/guards/python-callback/python-callback.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Study,
      StudyStatusHistory,
      StudyProcessingJob,
      StudyCodeSequence,
      User,
    ]),
  ],
  controllers: [StudiesController],
  providers: [StudiesService, RolesGuard, PythonCallbackGuard],
  exports: [StudiesService],
})
export class StudiesModule {}
