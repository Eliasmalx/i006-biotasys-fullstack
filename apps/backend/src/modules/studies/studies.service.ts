import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { catchError, of } from 'rxjs';
import { Study } from './entities/study.entity';
import { CreateStudyDto } from './dto/create-study.dto';

@Injectable()
export class StudiesService {
  constructor(
    @InjectRepository(Study)
    private readonly studyRepository: Repository<Study>,
    private readonly httpService: HttpService,
  ) {}

  async create(createStudyDto: CreateStudyDto) {
    if (!createStudyDto.organization_id) {
      throw new BadRequestException(
        'organization_id es requerido para crear el estudio',
      );
    }

    const { organization_id, ...payload } = createStudyDto;
    const study = this.studyRepository.create({
      ...payload,
      organization: { id: organization_id },
      status: 'PENDING',
    });
    return await this.studyRepository.save(study);
  }

  // Permite al laboratorio ver todos los estudios pendientes
  // Ahora solo devuelve los estudios de SU organización
  async findAll(organizationId: string) {
    return await this.studyRepository.find({
      where: { organization: { id: organizationId } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const study = await this.studyRepository.findOneBy({ id });
    if (!study) throw new NotFoundException('Estudio no encontrado');
    return study;
  }

  async uploadRawData(id: string, rawData: unknown) {
    const study = await this.findOne(id);
    study.raw_data = rawData;
    study.status = 'PROCESSING';
    await this.studyRepository.save(study);

    // Llamada a la IA con manejo de errores básico
    this.httpService
      .post('URL_DE_TU_SERVICIO_IA/process', {
        studyId: study.id,
        data: rawData,
      })
      .pipe(
        catchError(() => {
          // Si la IA falla, marcamos el estudio para no dejarlo colgado
          void this.studyRepository
            .update(id, { status: 'FAILED' })
            .catch(() => undefined);
          return of(null);
        }),
      )
      .subscribe();

    return study;
  }

  async updateWithAiResult(id: string, aiResult: unknown) {
    const study = await this.findOne(id);
    study.result_data = aiResult;
    study.status = 'COMPLETED';
    return await this.studyRepository.save(study);
  }
}
