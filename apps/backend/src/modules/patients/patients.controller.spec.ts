import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatiensController } from './patients.controller';
import { PatiensService } from './patients.service';
import { OrganizationOwnershipGuard } from '../../common/guards/owner-ship/organization-ownership.guard';
import { User } from '../users/entities/user.entity';
import { Patien } from './entities/patients.entity';

describe('PatiensController', () => {
  let controller: PatiensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatiensController],
      providers: [
        { provide: PatiensService, useValue: {} },
        { provide: OrganizationOwnershipGuard, useValue: { canActivate: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Patien), useValue: {} },
      ],
    }).compile();

    controller = module.get<PatiensController>(PatiensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
