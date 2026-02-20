import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './controllers/admin-users.controller';
import { SuperadminUsersController } from './controllers/superadmin-users.controller';
import { AdminUsersService } from './services/admin-users.service';
import { SuperadminUsersService } from './services/superadmin-users.service';

describe('UsersControllers', () => {
  it('AdminUsersController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [{ provide: AdminUsersService, useValue: {} }],
    }).compile();

    expect(module.get(AdminUsersController)).toBeDefined();
  });

  it('SuperadminUsersController should be defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperadminUsersController],
      providers: [{ provide: SuperadminUsersService, useValue: {} }],
    }).compile();

    expect(module.get(SuperadminUsersController)).toBeDefined();
  });
});
