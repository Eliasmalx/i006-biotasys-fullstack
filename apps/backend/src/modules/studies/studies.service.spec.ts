import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { StudiesService } from './studies.service';
import { Study } from './entities/study.entity';

describe('StudiesService', () => {
  let service: StudiesService;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  const httpServiceMock = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudiesService,
        {
          provide: getRepositoryToken(Study),
          useValue: repositoryMock,
        },
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<StudiesService>(StudiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should persist study with organization relation', async () => {
    const dto = {
      patient_code: 'PAT-1',
      study_code: 'BIO-1',
      organization_id: 'org-1',
    };

    repositoryMock.create.mockImplementation((input) => input);
    repositoryMock.save.mockResolvedValue({ id: 'study-1' });

    await service.create(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      patient_code: 'PAT-1',
      study_code: 'BIO-1',
      organization: { id: 'org-1' },
      status: 'PENDING',
    });
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  it('findAll should filter by organization id', async () => {
    repositoryMock.find.mockResolvedValue([]);

    await service.findAll('org-2');

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: { organization: { id: 'org-2' } },
      order: { created_at: 'DESC' },
    });
  });

  it('uploadRawData should set PROCESSING and call IA service', async () => {
    const study = {
      id: 'study-2',
      status: 'PENDING',
      raw_data: null,
    };

    repositoryMock.findOneBy.mockResolvedValue(study);
    repositoryMock.save.mockImplementation(async (value) => value);
    httpServiceMock.post.mockReturnValue(of({ data: {} }));

    const result = await service.uploadRawData('study-2', { any: 'payload' });

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 'study-2' });
    expect(repositoryMock.save).toHaveBeenCalledWith({
      ...study,
      raw_data: { any: 'payload' },
      status: 'PROCESSING',
    });
    expect(httpServiceMock.post).toHaveBeenCalledWith(
      'URL_DE_TU_SERVICIO_IA/process',
      {
        studyId: 'study-2',
        data: { any: 'payload' },
      },
    );
    expect(result.status).toBe('PROCESSING');
  });
});
