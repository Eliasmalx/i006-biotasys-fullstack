import { Test, TestingModule } from '@nestjs/testing';
import { PatiensService } from './patients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patien } from './entities/patients.entity';

describe('PatiensService', () => {
  let service: PatiensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatiensService,
        { provide: getRepositoryToken(Patien), useValue: {} },
      ],
    }).compile();

    service = module.get<PatiensService>(PatiensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
