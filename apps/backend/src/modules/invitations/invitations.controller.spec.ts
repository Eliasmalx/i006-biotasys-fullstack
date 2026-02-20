import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

type ServiceMock = jest.Mocked<Pick<InvitationsService, 'create' | 'update'>>;

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let serviceMock: ServiceMock;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [{ provide: InvitationsService, useValue: serviceMock }],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
    jest.clearAllMocks();
  });

  it('create: should call service.create(dto, req.user.userId)', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'a@b.com';
    dto.role = Role.PROFESSIONAL;
    dto.organizationId = '11111111-1111-1111-1111-111111111111';

    const userId = '22222222-2222-2222-2222-222222222222';

    // Tipamos el "req" exactamente como lo espera el controller (sin any)
    type CreateReq = Parameters<InvitationsController['create']>[0];
    const req = { user: { userId } } as unknown as CreateReq;

    const expected = { id: 'inv', token: 't' };
    serviceMock.create.mockResolvedValue(expected as never);

    const result = await controller.create(req, dto);

    // Evita warning unbound-method
    const createSpy = serviceMock.create;
    expect(createSpy).toHaveBeenCalledWith(dto, userId);
    expect(result).toEqual(expected);
  });

  it('update: should call service.update(id, dto)', async () => {
    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    const expected = { id: 'inv', status: InvitationStatus.ACCEPTED };
    serviceMock.update.mockResolvedValue(expected as never);

    const result = await controller.update('uuid', dto);

    const updateSpy = serviceMock.update;
    expect(updateSpy).toHaveBeenCalledWith('uuid', dto);
    expect(result).toEqual(expected);
  });
});
