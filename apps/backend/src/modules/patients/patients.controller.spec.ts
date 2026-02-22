import { Test, TestingModule } from '@nestjs/testing';
import { PatiensController } from './patients.controller';
import { PatiensService } from './patients.service';

describe('PatiensController', () => {
  let controller: PatiensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatiensController],
      providers: [{ provide: PatiensService, useValue: {} }],
    }).compile();

    controller = module.get<PatiensController>(PatiensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
