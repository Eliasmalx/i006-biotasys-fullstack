import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrgStatus } from '../../common/enums/org-status.enum';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

type OrgRepoMock = jest.Mocked<
  Pick<Repository<Organization>, 'create' | 'save' | 'findOneBy' | 'find'>
>;

const repoMock: OrgRepoMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
};

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: OrgRepoMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: getRepositoryToken(Organization), useValue: repoMock },
      ],
    }).compile();

    service = module.get(OrganizationsService);
    repo = module.get(getRepositoryToken(Organization));
    jest.clearAllMocks();
  });

  it('create: should create and save organization', async () => {
    const dto = new CreateOrganizationDto();
    dto.name = 'Org 1';

    const now = new Date();

    const entity: Organization = {
      id: 'uuid',
      name: 'Org 1',
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdBy: '22222222-2222-2222-2222-222222222222',
    };

    const saved: Organization = {
      ...entity,
    };

    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(saved);
  });

  it('update: should throw NotFound if org does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const patch = new UpdateOrganizationDto();
    patch.name = 'X';

    await expect(service.update('uuid', patch)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update: should merge dto and save', async () => {
    const now = new Date();

    const existing: Organization = {
      id: 'uuid',
      name: 'Old',
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdBy: '22222222-2222-2222-2222-222222222222',
    };

    const saved: Organization = {
      ...existing,
      name: 'New',
    };

    repo.findOneBy.mockResolvedValue(existing);
    repo.save.mockResolvedValue(saved);

    const patch = new UpdateOrganizationDto();
    patch.name = 'New';

    const result = await service.update('uuid', patch);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New' }),
    );
    expect(result).toEqual(saved);
  });

  it('findAll: should call repo.find and return result', async () => {
    const rows = [{ id: 'uuid' }] as any[];
    repo.find.mockResolvedValue(rows);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });
});
