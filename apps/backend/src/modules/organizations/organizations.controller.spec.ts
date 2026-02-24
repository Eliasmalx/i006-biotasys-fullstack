import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { InviteAdminDto } from './dto/invite-admin.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrgStatus } from '../../common/enums/org-status.enum';

const serviceMock = {
  createOrganizationAndInviteAdmin: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: OrganizationsService, useValue: serviceMock }],
    }).compile();

    controller = module.get(OrganizationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create: should call service with req user id and dto', async () => {
    const dto = new InviteAdminDto();
    dto.organizationName = 'Org 1';
    dto.adminEmail = 'admin@org.com';
    dto.adminFullName = 'Admin Org';

    const req = {
      user: { userId: '22222222-2222-2222-2222-222222222222' },
    } as Parameters<OrganizationsController['create']>[0];

    serviceMock.createOrganizationAndInviteAdmin.mockResolvedValue('token-123');

    const result = await controller.create(req, dto as any);

    expect(serviceMock.createOrganizationAndInviteAdmin).toHaveBeenCalledWith(
      req.user!.userId,
      dto,
    );
    expect(result).toMatchObject({ invitationToken: 'token-123' });
    expect(result.message).toEqual(expect.any(String));
  });

  it('update: should call service.update with id and dto', async () => {
    const id = 'uuid';

    const dto = new UpdateOrganizationDto();
    dto.name = 'New';

    const now = new Date();
    const saved = {
      id,
      name: 'New',
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    serviceMock.update.mockResolvedValue(saved);

    const result = await controller.update(id, dto);

    expect(serviceMock.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(saved);
  });

  it('findAll: should call service.findAll', async () => {
    const rows = [{ id: 'uuid' }];
    serviceMock.findAll.mockResolvedValue(rows);

    const result = await controller.findAll();

    expect(serviceMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(rows);
  });

  it('findOne: should call service.findOne', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 'uuid' });
    await controller.findOne('uuid');
    expect(serviceMock.findOne).toHaveBeenCalledWith('uuid');
  });

  it('remove: should call service.remove', async () => {
    serviceMock.remove.mockResolvedValue(undefined);
    await controller.remove('uuid');
    expect(serviceMock.remove).toHaveBeenCalledWith('uuid');
  });
});
