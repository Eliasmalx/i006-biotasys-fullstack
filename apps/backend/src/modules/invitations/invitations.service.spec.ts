import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { InvitationsService } from './invitations.service';
import { Invitation } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { EmailService } from '../../infrastructure/email/services/email.service';
import { Organization } from '../organizations/entities/organization.entity';

type InvitationRepoMock = jest.Mocked<
  Pick<
    Repository<Invitation>,
    'create' | 'save' | 'findOneBy' | 'findOne' | 'find'
  >
>;

const repoMock: InvitationRepoMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const organizationRepoMock = {
  findOne: jest.fn(),
};

const emailServiceMock = {
  sendUserInvitationEmail: jest.fn(),
};

describe('InvitationsService', () => {
  let service: InvitationsService;
  let repo: InvitationRepoMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: getRepositoryToken(Invitation), useValue: repoMock },
        { provide: getRepositoryToken(Organization), useValue: organizationRepoMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    repo = module.get<InvitationRepoMock>(getRepositoryToken(Invitation));
    jest.clearAllMocks();
    emailServiceMock.sendUserInvitationEmail.mockResolvedValue(undefined);
    organizationRepoMock.findOne.mockResolvedValue({
      id: 'org-1',
      name: 'Org 1',
    });
  });

  it('create: should create and save invitation and return debug token info in non-production', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'doctor@biotasys.com';
    dto.firstName = 'Juan';
    dto.lastName = 'Perez';
    dto.dni = '12345678Z';
    dto.role = Role.PROFESSIONAL;
    dto.colegiadoNumber = '083412345';

    const invitedByUserId = '22222222-2222-2222-2222-222222222222';
    const organizationId = '11111111-1111-1111-1111-111111111111';

    repo.create.mockImplementation((value) => value as unknown as Invitation);

    const saved: Invitation = {
      id: 'inv-1',
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dni: dto.dni,
      professionalId: 'BIO-2026-AR-00001',
      role: Role.PROFESSIONAL,
      status: InvitationStatus.PENDING,
      organizationId,
      tokenHash: 'x'.repeat(64),
      expiresAt: new Date(),
      invitedBy: invitedByUserId,
      createdAt: new Date(),
    };
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto, invitedByUserId, organizationId);

    expect(repo.create).toHaveBeenCalledTimes(1);

    const createArg = repo.create.mock.calls[0]?.[0] as Partial<Invitation>;
    expect(createArg).toMatchObject({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dni: dto.dni,
      role: dto.role,
      organizationId,
      invitedBy: invitedByUserId,
      status: InvitationStatus.PENDING,
    });
    expect(createArg.professionalId).toMatch(/^BIO-\d{4}-AR-[A-F0-9]{8}$/);
    expect(createArg.tokenHash).toEqual(expect.any(String));
    expect(createArg.tokenHash).toContain('$2');
    expect(createArg.expiresAt).toBeInstanceOf(Date);

    expect(repo.save).toHaveBeenCalled();
    expect(result.invitation).toBe(saved);
    expect(result.debug?.invitationToken).toHaveLength(64);
    expect(result.debug?.invitationLink).toContain(result.debug!.invitationToken);
  });

  it('update: should throw NotFound when invitation does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    await expect(service.update('inv', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update: should set acceptedAt when status becomes ACCEPTED', async () => {
    const existing: Invitation = {
      id: 'inv-1',
      email: 'doctor@biotasys.com',
      firstName: 'Juan',
      lastName: 'Perez',
      dni: '12345678Z',
      professionalId: 'BIO-2026-AR-00001',
      role: Role.PROFESSIONAL,
      status: InvitationStatus.PENDING,
      organizationId: '11111111-1111-1111-1111-111111111111',
      tokenHash: 'x'.repeat(64),
      expiresAt: new Date(),
      invitedBy: '22222222-2222-2222-2222-222222222222',
      createdAt: new Date(),
    };
    repo.findOneBy.mockResolvedValue(existing);
    repo.save.mockImplementation(async (value) => value as Invitation);

    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    const result = await service.update('inv-1', dto);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'inv-1',
        status: InvitationStatus.ACCEPTED,
        acceptedAt: expect.any(Date),
      }),
    );
    expect(result.status).toBe(InvitationStatus.ACCEPTED);
  });

  it('findAllByOrganization: should list invitations ordered by createdAt DESC', async () => {
    const rows = [{ id: 'inv-1' }] as Invitation[];
    repo.find.mockResolvedValue(rows);

    const result = await service.findAllByOrganization(
      '11111111-1111-1111-1111-111111111111',
    );

    expect(repo.find).toHaveBeenCalledWith({
      where: { organizationId: '11111111-1111-1111-1111-111111111111' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(rows);
  });
});
