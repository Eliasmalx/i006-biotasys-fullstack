import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OrganizationOwnershipGuard } from '../../common/guards/owner-ship/organization-ownership.guard';
import { User } from './entities/user.entity';
import { Patien } from '../patients/entities/patients.entity';

describe('UsersController', () => {
  it('UsersController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: {} },
        { provide: OrganizationOwnershipGuard, useValue: { canActivate: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Patien), useValue: {} },
      ],
    }).compile();

    expect(module.get(UsersController)).toBeDefined();
  });
});
