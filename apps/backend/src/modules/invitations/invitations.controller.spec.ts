import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

type InvitationsServiceMock = jest.Mocked<Pick<InvitationsService, 'update'>>;
type UsersServiceMock = jest.Mocked<
  Pick<UsersService, 'inviteUser' | 'listInvitations' | 'revokeInvitation'>
>;

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let invitationsServiceMock: InvitationsServiceMock;
  let usersServiceMock: UsersServiceMock;

  beforeEach(async () => {
    invitationsServiceMock = {
      update: jest.fn(),
    };
    usersServiceMock = {
      inviteUser: jest.fn(),
      listInvitations: jest.fn(),
      revokeInvitation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        { provide: InvitationsService, useValue: invitationsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
      ],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
    jest.clearAllMocks();
  });

  it('create: should call usersService.inviteUser with req.user data and dto', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'a@b.com';
    dto.role = Role.PROFESSIONAL;
    dto.organizationId = '11111111-1111-1111-1111-111111111111';

    const userId = '22222222-2222-2222-2222-222222222222';
    const organizationId = '11111111-1111-1111-1111-111111111111';

    // Tipamos el "req" exactamente como lo espera el controller (sin any)
    type CreateReq = Parameters<InvitationsController['create']>[0];
    const req = { user: { userId, organizationId } } as unknown as CreateReq;

    usersServiceMock.inviteUser.mockResolvedValue('token-123' as never);

    const result = await controller.create(req, dto);

    const inviteUserSpy = usersServiceMock.inviteUser;
    expect(inviteUserSpy).toHaveBeenCalledWith(userId, organizationId, dto);
    expect(result).toEqual({
      message: 'Usuario invitado exitosamente',
      invitationToken: 'token-123',
    });
  });

  it('update: should call service.update(id, dto)', async () => {
    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    const expected = { id: 'inv', status: InvitationStatus.ACCEPTED };
    invitationsServiceMock.update.mockResolvedValue(expected as never);

    const result = await controller.update('uuid', dto);

    const updateSpy = invitationsServiceMock.update;
    expect(updateSpy).toHaveBeenCalledWith('uuid', dto);
    expect(result).toEqual(expected);
  });
});
