import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, LessThanOrEqual, Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { CreateStudyDto } from './dto/create-study.dto';
import { ListStudiesQueryDto } from './dto/list-studies-query.dto';
import { RejectStudyDto } from './dto/reject-study.dto';
import { UploadStudyJsonDto } from './dto/upload-study-json.dto';
import { ProcessingResultDto } from './dto/processing-result.dto';
import { ReassignStudyDto } from './dto/reassign-study.dto';
import {
  PaginatedStudiesResponseDto,
  StudyResponseDto,
  StudyUserSummaryDto,
} from './dto/study-response.dto';
import { Study } from './entities/study.entity';
import { StudyStatusHistory } from './entities/study-status-history.entity';
import { StudyProcessingJob } from './entities/study-processing-job.entity';
import { StudyCodeSequence } from './entities/study-code-sequence.entity';
import { AiResult, ExternalAiResult } from './enums/ai-result.enum';
import { ProcessingJobStatus } from './enums/processing-job-status.enum';
import { PatientSex } from './enums/patient-sex.enum';
import { ProcessingState } from './enums/processing-state.enum';
import { StudyStatus } from './enums/study-status.enum';
import config from '../../config/dotenv.config';

type AuthenticatedUser = {
  userId: string;
  role: Role;
  email?: string;
};

@Injectable()
export class StudiesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StudiesService.name);
  private queueTimer: NodeJS.Timeout | null = null;
  private isQueueRunning = false;
  private readonly queueIntervalMs = 5000;

  constructor(
    @InjectRepository(Study)
    private readonly studyRepository: Repository<Study>,
    @InjectRepository(StudyStatusHistory)
    private readonly studyStatusHistoryRepository: Repository<StudyStatusHistory>,
    @InjectRepository(StudyProcessingJob)
    private readonly studyProcessingJobRepository: Repository<StudyProcessingJob>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  onModuleInit(): void {
    this.queueTimer = setInterval(() => {
      void this.processPendingJobs();
    }, this.queueIntervalMs);
  }

  onModuleDestroy(): void {
    if (this.queueTimer) {
      clearInterval(this.queueTimer);
      this.queueTimer = null;
    }
  }

  async createStudy(
    dto: CreateStudyDto,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    this.assertRole(currentUser, Role.NUTRICIONISTA);

    const assigneeUser = await this.userRepository.findOne({
      where: {
        id: dto.assigneeUserId,
      },
    });

    if (!assigneeUser) {
      throw new BadRequestException('Usuario asignado no encontrado');
    }

    if (!assigneeUser.isActive) {
      throw new BadRequestException('Usuario asignado inactivo');
    }

    if (!assigneeUser.emailVerified) {
      throw new BadRequestException('Usuario asignado con email no verificado');
    }

    if (!this.normalizeLaboratory(assigneeUser.laboratory)) {
      throw new BadRequestException(
        'Usuario asignado sin laboratorio/centro configurado',
      );
    }

    const studyCode = await this.generateStudyCode();
    const now = new Date();

    const study = this.studyRepository.create({
      studyCode,
      nutritionistId: currentUser.userId,
      assigneeUserId: dto.assigneeUserId,
      patientCode: dto.patientCode,
      patientAge: dto.patientAge,
      patientSex: dto.patientSex,
      studyDate: dto.studyDate,
      status: StudyStatus.SOLICITADO,
      aiResult: AiResult.SIN_RESULTADO,
      processingState: ProcessingState.PENDING,
      requestedAt: now,
    });

    const createdStudy = await this.studyRepository.save(study);

    await this.createStatusHistory({
      studyId: createdStudy.id,
      fromStatus: null,
      toStatus: StudyStatus.SOLICITADO,
      changedByUserId: currentUser.userId,
      note: 'Estudio creado por nutricionista',
    });

    return this.getStudyByIdForRole(createdStudy.id, currentUser);
  }

  async listNutritionistStudies(
    query: ListStudiesQueryDto,
    currentUser: AuthenticatedUser,
  ): Promise<PaginatedStudiesResponseDto> {
    this.assertRole(currentUser, Role.NUTRICIONISTA);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.studyRepository
      .createQueryBuilder('study')
      .leftJoinAndSelect('study.nutritionist', 'nutritionist')
      .leftJoinAndSelect('study.assignee', 'assignee')
      .andWhere('study.nutritionistId = :nutritionistId', {
        nutritionistId: currentUser.userId,
      });

    this.applyCommonFilters(qb, query);

    qb.orderBy('study.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return this.toPaginatedResponse(items, page, limit, total);
  }

  async listLaboratoryOrders(
    query: ListStudiesQueryDto,
    currentUser: AuthenticatedUser,
  ): Promise<PaginatedStudiesResponseDto> {
    this.assertRole(currentUser, Role.LABORATORIO);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.studyRepository
      .createQueryBuilder('study')
      .leftJoinAndSelect('study.nutritionist', 'nutritionist')
      .leftJoinAndSelect('study.assignee', 'assignee')
      .where('study.assigneeUserId = :assigneeUserId', {
        assigneeUserId: currentUser.userId,
      });

    this.applyCommonFilters(qb, query);

    qb.orderBy('study.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return this.toPaginatedResponse(items, page, limit, total);
  }

  async getStudyByIdForRole(
    studyId: string,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    const whereBase = { id: studyId };
    let study: Study | null = null;

    if (currentUser.role === Role.NUTRICIONISTA) {
      study = await this.studyRepository.findOne({
        where: { ...whereBase, nutritionistId: currentUser.userId },
        relations: ['nutritionist', 'assignee'],
      });
    } else if (currentUser.role === Role.LABORATORIO) {
      study = await this.studyRepository.findOne({
        where: { ...whereBase, assigneeUserId: currentUser.userId },
        relations: ['nutritionist', 'assignee'],
      });
    } else {
      throw new ForbiddenException('Rol no autorizado para consultar estudios');
    }

    if (!study) {
      throw new NotFoundException('Estudio no encontrado');
    }

    return this.toStudyResponse(study, true);
  }

  async markAsReceived(
    studyId: string,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    const study = await this.getLaboratoryStudyOrFail(studyId, currentUser);

    if (study.status !== StudyStatus.SOLICITADO) {
      throw new ConflictException(
        'Solo se puede marcar como recibido un estudio solicitado',
      );
    }

    const fromStatus = study.status;
    study.status = StudyStatus.RECIBIDO;
    study.receivedAt = new Date();

    const saved = await this.studyRepository.save(study);
    await this.createStatusHistory({
      studyId: saved.id,
      fromStatus,
      toStatus: saved.status,
      changedByUserId: currentUser.userId,
      note: 'Orden recibida por laboratorio',
    });

    return this.toStudyResponse(saved, true);
  }

  async markAsInAnalysis(
    studyId: string,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    const study = await this.getLaboratoryStudyOrFail(studyId, currentUser);

    if (study.status !== StudyStatus.RECIBIDO) {
      throw new ConflictException(
        'Solo se puede iniciar analisis desde estado RECIBIDO',
      );
    }

    const fromStatus = study.status;
    study.status = StudyStatus.EN_ANALISIS;
    study.analysisStartedAt = new Date();

    const saved = await this.studyRepository.save(study);
    await this.createStatusHistory({
      studyId: saved.id,
      fromStatus,
      toStatus: saved.status,
      changedByUserId: currentUser.userId,
      note: 'Analisis iniciado por laboratorio',
    });

    return this.toStudyResponse(saved, true);
  }

  async rejectStudy(
    studyId: string,
    dto: RejectStudyDto,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    const study = await this.getLaboratoryStudyOrFail(studyId, currentUser);
    const allowedStatuses = [
      StudyStatus.SOLICITADO,
      StudyStatus.RECIBIDO,
      StudyStatus.EN_ANALISIS,
    ];

    if (!allowedStatuses.includes(study.status)) {
      throw new ConflictException(
        'El estudio no puede ser rechazado en su estado actual',
      );
    }

    const fromStatus = study.status;
    study.status = StudyStatus.RECHAZADO;
    study.rejectedAt = new Date();
    study.rejectionReason = dto.reason;
    study.processingState = ProcessingState.ERROR;

    const saved = await this.studyRepository.save(study);
    await this.createStatusHistory({
      studyId: saved.id,
      fromStatus,
      toStatus: saved.status,
      changedByUserId: currentUser.userId,
      note: `Rechazado por laboratorio: ${dto.reason}`,
    });

    return this.toStudyResponse(saved, true);
  }

  async reassignStudy(
    studyId: string,
    dto: ReassignStudyDto,
    currentUser: AuthenticatedUser,
  ): Promise<StudyResponseDto> {
    this.assertRole(currentUser, Role.LABORATORIO);

    const actor = await this.userRepository.findOne({
      where: { id: currentUser.userId },
    });
    if (!actor) {
      throw new NotFoundException('Usuario autenticado no encontrado');
    }

    const actorLaboratory = this.normalizeLaboratory(actor.laboratory);
    if (!actorLaboratory) {
      throw new ForbiddenException(
        'Usuario laboratorio sin centro/laboratorio configurado',
      );
    }

    const study = await this.studyRepository.findOne({
      where: { id: studyId },
      relations: ['nutritionist', 'assignee'],
    });
    if (!study) {
      throw new NotFoundException('Estudio no encontrado');
    }

    if (![StudyStatus.SOLICITADO, StudyStatus.RECIBIDO].includes(study.status)) {
      throw new ConflictException(
        'Solo se puede reasignar en estados SOLICITADO o RECIBIDO',
      );
    }

    const currentAssigneeLaboratory = this.normalizeLaboratory(
      study.assignee?.laboratory,
    );
    if (!currentAssigneeLaboratory || currentAssigneeLaboratory !== actorLaboratory) {
      throw new ForbiddenException(
        'Solo puedes reasignar estudios de tu mismo laboratorio',
      );
    }

    if (dto.assigneeUserId === study.assigneeUserId) {
      throw new ConflictException('El estudio ya esta asignado a ese usuario');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: dto.assigneeUserId },
    });
    if (!targetUser) {
      throw new BadRequestException('Usuario destino no encontrado');
    }
    if (!targetUser.isActive) {
      throw new BadRequestException('Usuario destino inactivo');
    }
    if (!targetUser.emailVerified) {
      throw new BadRequestException('Usuario destino con email no verificado');
    }

    const targetLaboratory = this.normalizeLaboratory(targetUser.laboratory);
    if (!targetLaboratory) {
      throw new BadRequestException(
        'Usuario destino sin laboratorio/centro configurado',
      );
    }
    if (targetLaboratory !== actorLaboratory) {
      throw new BadRequestException(
        'Usuario destino no pertenece al mismo laboratorio',
      );
    }

    const previousAssigneeEmail = study.assignee?.email ?? study.assigneeUserId;
    study.assigneeUserId = targetUser.id;
    study.assignee = targetUser;

    const saved = await this.studyRepository.save(study);
    await this.createStatusHistory({
      studyId: saved.id,
      fromStatus: saved.status,
      toStatus: saved.status,
      changedByUserId: currentUser.userId,
      note: `Reasignado de ${previousAssigneeEmail} a ${targetUser.email}`,
    });

    return this.toStudyResponse(saved, true);
  }

  async uploadStudyRawJson(
    studyId: string,
    dto: UploadStudyJsonDto,
    currentUser: AuthenticatedUser,
  ): Promise<{ message: string; study: StudyResponseDto }> {
    const study = await this.getLaboratoryStudyOrFail(studyId, currentUser);

    const allowedStatuses = [
      StudyStatus.SOLICITADO,
      StudyStatus.RECIBIDO,
      StudyStatus.EN_ANALISIS,
      StudyStatus.RECHAZADO,
    ];
    if (!allowedStatuses.includes(study.status)) {
      throw new ConflictException(
        'No se puede cargar JSON en el estado actual del estudio',
      );
    }

    this.validateRawJsonAgainstStudy(dto.rawJson, study);

    const fromStatus = study.status;

    study.rawJson = dto.rawJson;
    study.processingState = ProcessingState.PENDING;
    study.processingError = null;
    study.processingAttempts = 0;
    study.lastProcessingAt = null;

    if (study.status === StudyStatus.RECHAZADO) {
      study.rejectionReason = null;
      study.rejectedAt = null;
    }

    const savedStudy = await this.studyRepository.save(study);

    if (fromStatus !== savedStudy.status) {
      await this.createStatusHistory({
        studyId: savedStudy.id,
        fromStatus,
        toStatus: savedStudy.status,
        changedByUserId: currentUser.userId,
        note: 'Analisis iniciado por carga de JSON',
      });
    }

    await this.studyProcessingJobRepository.update(
      {
        studyId: savedStudy.id,
        status: In([
          ProcessingJobStatus.PENDING,
          ProcessingJobStatus.PROCESSING,
        ]),
      },
      {
        status: ProcessingJobStatus.FAILED,
        lastError: 'Replaced by a newer upload',
      },
    );

    const job = this.studyProcessingJobRepository.create({
      studyId: savedStudy.id,
      payload: {
        studyId: savedStudy.id,
        studyCode: savedStudy.studyCode,
        rawJson: dto.rawJson,
      },
      runAt: new Date(),
      status: ProcessingJobStatus.PENDING,
      attempt: 0,
    });
    await this.studyProcessingJobRepository.save(job);

    void this.processPendingJobs();

    return {
      message: 'JSON recibido y encolado para procesamiento',
      study: this.toStudyResponse(savedStudy, true),
    };
  }

  async handleProcessingResultCallback(
    studyId: string,
    dto: ProcessingResultDto,
  ): Promise<StudyResponseDto> {
    const study = await this.studyRepository.findOne({
      where: { id: studyId },
      relations: ['nutritionist', 'assignee'],
    });

    if (!study) {
      throw new NotFoundException('Estudio no encontrado');
    }

    const fromStatus = study.status;
    const now = new Date();
    const resolvedPdfUrl = dto.pdfUrl ?? dto.file_url;
    const resolvedNormalizedJson = this.resolveNormalizedJson(dto);

    if (!resolvedPdfUrl) {
      throw new BadRequestException('pdfUrl o file_url es requerido');
    }

    if (!resolvedNormalizedJson) {
      throw new BadRequestException(
        'normalizedJson o payload IA en snake_case es requerido',
      );
    }

    study.pdfUrl = resolvedPdfUrl;
    study.normalizedJson = resolvedNormalizedJson;
    study.aiResult = this.mapExternalAiResult(dto.aiResult);
    study.processingState = ProcessingState.SUCCESS;
    study.processingError = null;
    study.lastProcessingAt = now;
    study.status = StudyStatus.INFORME_LISTO;
    study.completedAt = now;
    study.rejectionReason = null;
    study.rejectedAt = null;

    const saved = await this.studyRepository.save(study);
    await this.studyProcessingJobRepository.update(
      {
        studyId: saved.id,
        status: In([
          ProcessingJobStatus.PENDING,
          ProcessingJobStatus.PROCESSING,
        ]),
      },
      {
        status: ProcessingJobStatus.COMPLETED,
        lastError: null,
      },
    );

    if (fromStatus !== saved.status) {
      await this.createStatusHistory({
        studyId: saved.id,
        fromStatus,
        toStatus: saved.status,
        changedByUserId: null,
        note: 'Resultado recibido desde backend Python',
      });
    }

    return this.toStudyResponse(saved, true);
  }

  async processPendingJobs(): Promise<void> {
    if (this.isQueueRunning) return;
    this.isQueueRunning = true;

    try {
      const pendingJobs = await this.studyProcessingJobRepository.find({
        where: {
          status: ProcessingJobStatus.PENDING,
          runAt: LessThanOrEqual(new Date()),
        },
        order: { runAt: 'ASC' },
        take: 10,
      });

      for (const job of pendingJobs) {
        await this.processSingleJob(job.id);
      }
    } finally {
      this.isQueueRunning = false;
    }
  }

  private async processSingleJob(jobId: string): Promise<void> {
    const claimResult = await this.studyProcessingJobRepository
      .createQueryBuilder()
      .update(StudyProcessingJob)
      .set({ status: ProcessingJobStatus.PROCESSING })
      .where('id = :jobId', { jobId })
      .andWhere('status = :pending', { pending: ProcessingJobStatus.PENDING })
      .execute();

    if (!claimResult.affected) {
      return;
    }

    const job = await this.studyProcessingJobRepository.findOne({
      where: { id: jobId },
    });
    if (!job) return;

    const study = await this.studyRepository.findOne({
      where: { id: job.studyId },
    });
    if (!study || !study.rawJson) {
      await this.studyProcessingJobRepository.update(job.id, {
        status: ProcessingJobStatus.FAILED,
        lastError: 'Study or rawJson not found',
      });
      return;
    }

    try {
      await this.sendStudyToPython(study);

      await this.studyProcessingJobRepository.update(job.id, {
        status: ProcessingJobStatus.COMPLETED,
        lastError: null,
      });

      const now = new Date();
      const shouldMoveToAnalysis = study.status !== StudyStatus.EN_ANALISIS;
      await this.studyRepository.update(study.id, {
        status: StudyStatus.EN_ANALISIS,
        processingState: ProcessingState.PENDING,
        processingError: null,
        processingAttempts: job.attempt + 1,
        lastProcessingAt: now,
        rejectionReason: null,
        rejectedAt: null,
        analysisStartedAt: study.analysisStartedAt ?? now,
      });

      if (shouldMoveToAnalysis) {
        await this.createStatusHistory({
          studyId: study.id,
          fromStatus: study.status,
          toStatus: StudyStatus.EN_ANALISIS,
          changedByUserId: null,
          note: 'Enviado correctamente al backend Python',
        });
      }
    } catch (error: unknown) {
      const errorMessage = this.getErrorMessage(error);
      const nextAttempt = job.attempt + 1;
      const maxRetries = Math.max(1, config.ai.maxRetries);
      const now = new Date();

      if (nextAttempt >= maxRetries) {
        await this.studyProcessingJobRepository.update(job.id, {
          status: ProcessingJobStatus.FAILED,
          attempt: nextAttempt,
          lastError: errorMessage,
        });

        const technicalReason = `IA_PROCESSING_FAILED: ${errorMessage.slice(0, 300)}`;
        const fromStatus = study.status;

        await this.studyRepository.update(study.id, {
          status: StudyStatus.RECHAZADO,
          rejectedAt: now,
          rejectionReason: technicalReason,
          processingState: ProcessingState.ERROR,
          processingError: errorMessage,
          processingAttempts: nextAttempt,
          lastProcessingAt: now,
        });

        if (fromStatus !== StudyStatus.RECHAZADO) {
          await this.createStatusHistory({
            studyId: study.id,
            fromStatus,
            toStatus: StudyStatus.RECHAZADO,
            changedByUserId: null,
            note: 'Rechazo automatico por fallo de IA tras agotar reintentos',
          });
        }
      } else {
        await this.studyProcessingJobRepository.update(job.id, {
          status: ProcessingJobStatus.PENDING,
          attempt: nextAttempt,
          runAt: this.calculateBackoffRunAt(nextAttempt),
          lastError: errorMessage,
        });

        await this.studyRepository.update(study.id, {
          processingState: ProcessingState.ERROR,
          processingError: errorMessage,
          processingAttempts: nextAttempt,
          lastProcessingAt: now,
        });
      }

      this.logger.error(
        `Error procesando estudio ${study.studyCode}: ${errorMessage}`,
      );
    }
  }

  private async sendStudyToPython(study: Study): Promise<void> {
    if (!config.ai.serviceUrl) {
      throw new Error('AI_SERVICE_URL is not configured');
    }

    const timeoutMs = config.ai.requestTimeoutMs;
    const backendBase =
      config.ai.backendPublicUrl || `http://localhost:${config.port}`;
    const callbackUrl = `${backendBase.replace(/\/$/, '')}/api/studies/${study.id}/processing-result`;

    const payload = {
      studyId: study.id,
      studyCode: study.studyCode,
      rawJson: study.rawJson,
      callbackUrl,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (config.ai.serviceApiKey) {
      headers['X-API-Key'] = config.ai.serviceApiKey;
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      const response = await fetch(config.ai.serviceUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Python service responded ${response.status}: ${errorBody.slice(0, 300)}`,
        );
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private applyCommonFilters(
    qb: ReturnType<Repository<Study>['createQueryBuilder']>,
    query: ListStudiesQueryDto,
  ): void {
    if (query.search) {
      const searchTerm = `%${query.search}%`;
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('study.patientCode ILIKE :searchTerm', { searchTerm })
            .orWhere('study.studyCode ILIKE :searchTerm', { searchTerm });
        }),
      );
    }

    if (query.assigneeUserId) {
      qb.andWhere('study.assigneeUserId = :assigneeUserId', {
        assigneeUserId: query.assigneeUserId,
      });
    }

    if (query.status) {
      qb.andWhere('study.status = :status', { status: query.status });
    }

    if (query.aiResult) {
      qb.andWhere('study.aiResult = :aiResult', { aiResult: query.aiResult });
    }

    if (query.dateFrom) {
      qb.andWhere('study.studyDate >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('study.studyDate <= :dateTo', { dateTo: query.dateTo });
    }
  }

  private toPaginatedResponse(
    items: Study[],
    page: number,
    limit: number,
    total: number,
  ): PaginatedStudiesResponseDto {
    return {
      data: items.map((item) => this.toStudyResponse(item, false)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private toStudyResponse(
    study: Study,
    includePayload: boolean,
  ): StudyResponseDto {
    return {
      id: study.id,
      studyCode: study.studyCode,
      patientCode: study.patientCode,
      patientAge: study.patientAge,
      patientSex: study.patientSex,
      studyDate: study.studyDate,
      status: study.status,
      aiResult: study.aiResult,
      processingState: study.processingState,
      processingError: study.processingError,
      pdfUrl: study.pdfUrl,
      normalizedJson: includePayload
        ? (study.normalizedJson ?? null)
        : undefined,
      rawJson: includePayload ? (study.rawJson ?? null) : undefined,
      rejectionReason: study.rejectionReason,
      processingAttempts: study.processingAttempts,
      lastProcessingAt: study.lastProcessingAt,
      requestedAt: study.requestedAt,
      receivedAt: study.receivedAt,
      analysisStartedAt: study.analysisStartedAt,
      completedAt: study.completedAt,
      rejectedAt: study.rejectedAt,
      createdAt: study.createdAt,
      updatedAt: study.updatedAt,
      nutritionist: study.nutritionist
        ? this.toStudyUserSummary(study.nutritionist)
        : undefined,
      assignee: study.assignee
        ? this.toStudyUserSummary(study.assignee)
        : undefined,
    };
  }

  private toStudyUserSummary(user: User): StudyUserSummaryDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  private mapExternalAiResult(externalResult: ExternalAiResult): AiResult {
    switch (externalResult) {
      case ExternalAiResult.EQUILIBRADA:
        return AiResult.EQUILIBRADA;
      case ExternalAiResult.ALTERADA:
        return AiResult.ALTERADA;
      case ExternalAiResult.INCONCLUSA:
        return AiResult.INCONCLUSA;
      case ExternalAiResult.CRITICA:
        return AiResult.CRITICA;
      case ExternalAiResult.SIN_RESULTADO:
      default:
        return AiResult.SIN_RESULTADO;
    }
  }

  private resolveNormalizedJson(
    dto: ProcessingResultDto,
  ): Record<string, unknown> | null {
    if (dto.normalizedJson && this.isNonEmptyObject(dto.normalizedJson)) {
      return dto.normalizedJson;
    }

    const externalPayload: Record<string, unknown> = {};

    if (dto.study_code) externalPayload.study_code = dto.study_code;
    if (dto.nutricionist) externalPayload.nutricionist = dto.nutricionist;
    if (dto.patient) externalPayload.patient = dto.patient;
    if (dto.data) externalPayload.data = dto.data;
    if (dto.interpretation)
      externalPayload.interpretation = dto.interpretation;
    if (dto.study_date) externalPayload.study_date = dto.study_date;
    if (dto.report_date) externalPayload.report_date = dto.report_date;
    if (dto.processingMeta) externalPayload.processingMeta = dto.processingMeta;

    if (!this.isNonEmptyObject(externalPayload)) {
      return null;
    }

    return externalPayload;
  }

  private isNonEmptyObject(value: Record<string, unknown>): boolean {
    return Object.keys(value).length > 0;
  }

  private normalizeLaboratory(value?: string | null): string | null {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private validateRawJsonAgainstStudy(
    rawJson: Record<string, unknown>,
    study: Study,
  ): void {
    const rawPatientCode = this.getRawJsonString(rawJson, 'patientCode');
    if (!rawPatientCode) {
      throw new BadRequestException('rawJson.patientCode es requerido');
    }
    if (rawPatientCode !== study.patientCode) {
      throw new BadRequestException(
        'rawJson.patientCode no coincide con el estudio',
      );
    }

    const rawPatientAge = this.getRawJsonNumber(rawJson, 'patientAge');
    if (rawPatientAge === null) {
      throw new BadRequestException('rawJson.patientAge es requerido');
    }
    if (rawPatientAge !== study.patientAge) {
      throw new BadRequestException(
        'rawJson.patientAge no coincide con el estudio',
      );
    }

    const rawPatientSex = this.getRawJsonString(rawJson, 'patientSex');
    if (!rawPatientSex) {
      throw new BadRequestException('rawJson.patientSex es requerido');
    }
    const normalizedSex = rawPatientSex.trim().toUpperCase();
    if (!Object.values(PatientSex).includes(normalizedSex as PatientSex)) {
      throw new BadRequestException(
        'rawJson.patientSex invalido. Valores permitidos: MASCULINO, FEMENINO',
      );
    }
    if (normalizedSex !== study.patientSex) {
      throw new BadRequestException(
        'rawJson.patientSex no coincide con el estudio',
      );
    }

    const rawStudyDate = this.getRawJsonString(rawJson, 'studyDate');
    if (!rawStudyDate) {
      throw new BadRequestException('rawJson.studyDate es requerido');
    }
    const normalizedStudyDate = this.normalizeToDateOnly(rawStudyDate);
    if (!normalizedStudyDate) {
      throw new BadRequestException(
        'rawJson.studyDate invalido. Usa formato YYYY-MM-DD o ISO 8601',
      );
    }
    if (normalizedStudyDate !== study.studyDate) {
      throw new BadRequestException(
        'rawJson.studyDate no coincide con el estudio',
      );
    }
  }

  private getRawJsonString(
    rawJson: Record<string, unknown>,
    key: string,
  ): string | null {
    const value = rawJson[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private getRawJsonNumber(
    rawJson: Record<string, unknown>,
    key: string,
  ): number | null {
    const value = rawJson[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private normalizeToDateOnly(value: string): string | null {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toISOString().slice(0, 10);
  }

  private async getLaboratoryStudyOrFail(
    studyId: string,
    currentUser: AuthenticatedUser,
  ): Promise<Study> {
    this.assertRole(currentUser, Role.LABORATORIO);

    const study = await this.studyRepository.findOne({
      where: {
        id: studyId,
        assigneeUserId: currentUser.userId,
      },
      relations: ['nutritionist', 'assignee'],
    });

    if (!study) {
      throw new NotFoundException('Estudio no encontrado');
    }

    return study;
  }

  private assertRole(currentUser: AuthenticatedUser, expectedRole: Role): void {
    if (currentUser.role !== expectedRole) {
      throw new ForbiddenException('No tienes permisos para esta operacion');
    }
  }

  private async createStatusHistory(params: {
    studyId: string;
    fromStatus: StudyStatus | null;
    toStatus: StudyStatus;
    changedByUserId: string | null;
    note?: string;
  }): Promise<void> {
    const history = this.studyStatusHistoryRepository.create({
      studyId: params.studyId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      changedByUserId: params.changedByUserId,
      note: params.note,
    });

    await this.studyStatusHistoryRepository.save(history);
  }

  private async generateStudyCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        let sequence = await queryRunner.manager.findOne(StudyCodeSequence, {
          where: { key: 'global' },
          lock: { mode: 'pessimistic_write' },
        });

        if (!sequence) {
          sequence = queryRunner.manager.create(StudyCodeSequence, {
            key: 'global',
            currentValue: 0,
          });
        }

        sequence.currentValue += 1;
        await queryRunner.manager.save(sequence);
        await queryRunner.commitTransaction();

        return `BIO-AR-${String(sequence.currentValue).padStart(5, '0')}`;
      } catch (error: unknown) {
        await queryRunner.rollbackTransaction();

        if (this.isUniqueViolation(error)) {
          continue;
        }
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    throw new InternalServerErrorException(
      'No se pudo generar codigo de estudio unico',
    );
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || !error) return false;
    return (error as { code?: string }).code === '23505';
  }

  private calculateBackoffRunAt(attempt: number): Date {
    const delayMs = Math.max(1000, config.ai.retryDelayMs);
    return new Date(Date.now() + delayMs);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Unknown processing error';
  }
}
