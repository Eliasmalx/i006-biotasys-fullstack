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

type InvitationRepoMock = jest.Mocked<
  Pick<Repository<Invitation>, 'create' | 'save' | 'findOneBy'>
>;

const repoMock: InvitationRepoMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
};

describe('InvitationsService', () => {
  let service: InvitationsService;
  let repo: InvitationRepoMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: getRepositoryToken(Invitation), useValue: repoMock },
      ],
    }).compile();

    service = module.get(InvitationsService);
    repo = module.get(getRepositoryToken(Invitation));
    jest.clearAllMocks();
  });

  it('create: should build tokenHash/expiresAt, save, and return safe + token', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'a@b.com';
    dto.role = Role.PROFESSIONAL;
    dto.organizationId = '11111111-1111-1111-1111-111111111111';

    const invitedByUserId = '22222222-2222-2222-2222-222222222222';

    const entity = {} as Invitation;
    repo.create.mockReturnValue(entity);

    const saved: Invitation = {
      id: 'inv',
      tokenHash: 'hash',
      email: dto.email,
      role: dto.role,
      organizationId: dto.organizationId,
      invitedByUserId,
      status: InvitationStatus.PENDING,
      expiresAt: new Date(),
      createdAt: new Date(),
    };
    repo.save.mockResolvedValue(saved);

    const result = await service.create(dto, invitedByUserId);

    const createArg = repo.create.mock.calls[0]?.[0] as unknown as {
      email: string;
      role: Role;
      organizationId: string;
      invitedByUserId: string;
      tokenHash: string;
      expiresAt: Date;
    };

    expect(createArg).toMatchObject({
      email: dto.email,
      role: dto.role,
      organizationId: dto.organizationId,
      invitedByUserId,
    });
    expect(createArg.tokenHash).toHaveLength(64);
    expect(createArg.expiresAt).toBeInstanceOf(Date);

    expect(repo.save).toHaveBeenCalledWith(entity);

    expect('tokenHash' in result).toBe(false);
    expect(result.token).toHaveLength(64);
    expect(result).toMatchObject({
      id: saved.id,
      email: saved.email,
      role: saved.role,
      organizationId: saved.organizationId,
      invitedByUserId: saved.invitedByUserId,
      status: saved.status,
    });
  });

  it('update: should throw NotFound when invitation does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);

    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    await expect(service.update('inv', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update: should set acceptedAt when status becomes ACCEPTED and save', async () => {
    const existing: Invitation = {
      id: 'inv',
      tokenHash: 'hash',
      email: 'a@b.com',
      role: Role.PROFESSIONAL,
      organizationId: '11111111-1111-1111-1111-111111111111',
      invitedByUserId: '22222222-2222-2222-2222-222222222222',
      status: InvitationStatus.PENDING,
      expiresAt: new Date(),
      createdAt: new Date(),
    };

    repo.findOneBy.mockResolvedValue(existing);

    const saved: Invitation = {
      ...existing,
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
    };
    repo.save.mockResolvedValue(saved);

    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    const result = await service.update('inv', dto);
    const anyDate = expect.any(Date) as unknown as Date;

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'inv',
        status: InvitationStatus.ACCEPTED,
        acceptedAt: anyDate,
      }),
    );

    expect('tokenHash' in result).toBe(false);
    expect(result).toMatchObject({
      id: 'inv',
      status: InvitationStatus.ACCEPTED,
    });
  });
});
