import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrgStatus } from '../../common/enums/org-status.enum';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { EmailService } from '../../infrastructure/email/services/email.service';

type OrgRepoMock = jest.Mocked<
  Pick<
    Repository<Organization>,
    'create' | 'save' | 'findOneBy' | 'find' | 'findOne' | 'merge' | 'remove'
  >
>;

const repoMock: OrgRepoMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
};

const userRepoMock = {
  findOne: jest.fn(),
};

const invitationRepoMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const emailServiceMock = {
  sendOrgAdminInvitationEmail: jest.fn(),
};

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repo: OrgRepoMock;
  let existingOrg: Organization;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: getRepositoryToken(Organization), useValue: repoMock },
        { provide: getRepositoryToken(User), useValue: userRepoMock },
        {
          provide: getRepositoryToken(Invitation),
          useValue: invitationRepoMock,
        },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    const now = new Date();

    existingOrg = {
      id: 'uuid',
      name: 'Old',
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdBy: '22222222-2222-2222-2222-222222222222',
    };

    service = module.get(OrganizationsService);
    repo = module.get(getRepositoryToken(Organization));
    jest.clearAllMocks();
    emailServiceMock.sendOrgAdminInvitationEmail.mockResolvedValue(undefined);
  });

  it('createOrganizationAndInviteAdmin: should create organization and invitation', async () => {
    const dto = new CreateOrganizationDto();
    dto.organizationName = 'Org 1';
    dto.adminEmail = 'admin@org.com';
    dto.adminFullName = 'Admin Org';
    dto.adminDni = '12345678A';
    dto.adminProfessionalId = 'BIO-2026-AR-00001';
    dto.cif = 'B12345678';
    dto.centerId = 'H08012345';
    dto.address = 'Calle Falsa 123';
    dto.city = 'Madrid';
    dto.phone = '912345678';
    dto.specialty = 'General';

    const now = new Date();

    const entity: Organization = {
      id: 'uuid',
      name: 'Org 1',
      cif: dto.cif,
      centerId: dto.centerId,
      address: dto.address,
      city: dto.city,
      phone: dto.phone,
      specialty: dto.specialty,
      status: OrgStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdBy: '22222222-2222-2222-2222-222222222222',
    };

    const saved: Organization = {
      ...entity,
    };

    userRepoMock.findOne.mockResolvedValue(null);
    repo.findOne.mockResolvedValueOnce(null); // org by cif
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(saved);
    invitationRepoMock.create.mockReturnValue({} as Invitation);
    invitationRepoMock.save.mockResolvedValue({ id: 'inv' } as Invitation);

    const result = await service.createOrganizationAndInviteAdmin(
      '22222222-2222-2222-2222-222222222222',
      dto,
    );

    expect(userRepoMock.findOne).toHaveBeenCalled();
    expect(repo.findOne).toHaveBeenCalledWith({ where: { cif: dto.cif } });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.organizationName,
        cif: dto.cif,
        createdBy: '22222222-2222-2222-2222-222222222222',
      }),
    );
    expect(repo.save).toHaveBeenCalledWith(entity);
    expect(invitationRepoMock.create).toHaveBeenCalled();
    expect(invitationRepoMock.save).toHaveBeenCalled();
    expect(emailServiceMock.sendOrgAdminInvitationEmail).toHaveBeenCalled();
    expect(typeof result).toBe('string');
    expect(result.length).toBe(64);
  });

  it('update: should throw NotFound if org does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const patch = new UpdateOrganizationDto();
    patch.organizationName = 'X';

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
    repo.merge.mockImplementation((entity, patch) => ({ ...entity, ...patch }));
    repo.save.mockResolvedValue(saved);

    const patch = new UpdateOrganizationDto();
    patch.organizationName = 'New';

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
  it('findOne: should return org if found', async () => {
    repo.findOneBy.mockResolvedValue(existingOrg);
    await expect(service.findOne('uuid')).resolves.toBe(existingOrg);
  });

  it('findOne: should throw NotFound if missing', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException);
  });
  it('remove: should remove when org exists', async () => {
    repo.findOneBy.mockResolvedValue(existingOrg);
    repo.save.mockResolvedValue({ ...existingOrg, status: OrgStatus.INACTIVE });
    await expect(service.remove('uuid')).resolves.toBeUndefined();
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uuid', status: OrgStatus.INACTIVE }),
    );
  });
  it('remove: should throw NotFound if missing', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.remove('uuid')).rejects.toThrow(NotFoundException);
  });
});
