import { Test, TestingModule } from '@nestjs/testing';
import { StudiesController } from './studies.controller';
import { StudiesService } from './studies.service';
import { Role } from '../../common/enums/role.enum';

describe('StudiesController', () => {
  let controller: StudiesController;
  let studiesService: jest.Mocked<StudiesService>;

  const studiesServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    uploadRawData: jest.fn(),
    updateWithAiResult: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudiesController],
      providers: [
        {
          provide: StudiesService,
          useValue: studiesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<StudiesController>(StudiesController);
    studiesService = module.get(StudiesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should use organizationId from jwt user', async () => {
    const dto = {
      patient_code: 'PAT-2026-0001',
      study_code: 'BIO-2026-AR-00001',
    };
    const req = {
      user: {
        userId: 'user-1',
        email: 'pro1@test.com',
        role: Role.PROFESSIONAL,
        organizationId: 'org-1',
      },
    };
    studiesService.create.mockResolvedValue({ id: 'study-1' } as never);

    await controller.create(dto, req);

    expect(dto.organization_id).toBe('org-1');
    expect(studiesService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should query studies by jwt organizationId', async () => {
    const req = {
      user: {
        userId: 'user-2',
        email: 'lab@test.com',
        role: Role.LAB_OPERATOR,
        organizationId: 'org-2',
      },
    };

    await controller.findAll(req);

    expect(studiesService.findAll).toHaveBeenCalledWith('org-2');
  });
});
