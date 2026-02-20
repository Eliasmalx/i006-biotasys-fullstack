import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrgStatus } from '../../common/enums/org-status.enum';

const serviceMock = {
  create: jest.fn(),
  update: jest.fn(),
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

  it('create: should call service.create with dto', async () => {
    const dto = new CreateOrganizationDto();
    dto.name = 'Org 1';
    dto.status = OrgStatus.ACTIVE;

    const now = new Date();
    const saved = {
      id: 'uuid',
      name: 'Org 1',
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    serviceMock.create.mockResolvedValue(saved);

    const result = await controller.create(dto);

    expect(serviceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(saved);
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
});
