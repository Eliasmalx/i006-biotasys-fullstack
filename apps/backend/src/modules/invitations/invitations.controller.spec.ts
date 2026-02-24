import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Role } from '../../common/enums/role.enum';
import { InvitationStatus } from '../../common/enums/invitation-status.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';

type InvitationsServiceMock = jest.Mocked<
  Pick<InvitationsService, 'create' | 'update'>
>;

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let serviceMock: InvitationsServiceMock;

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

  it('create: should call invitationsService.create and map response payload', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'doctor@biotasys.com';
    dto.firstName = 'Juan';
    dto.lastName = 'Perez';
    dto.dni = '12345678Z';
    dto.role = Role.PROFESSIONAL;

    const userId = '22222222-2222-2222-2222-222222222222';
    const organizationId = '11111111-1111-1111-1111-111111111111';

    type CreateReq = Parameters<InvitationsController['create']>[0];
    const req = { user: { userId, organizationId } } as unknown as CreateReq;

    serviceMock.create.mockResolvedValue({
      id: 'inv-1',
      professionalId: 'BIO-2026-AR-00001',
      email: dto.email,
      token: 'token-123',
      expiresAt: new Date('2026-03-01T00:00:00.000Z'),
    } as never);

    const result = await controller.create(req, dto);

    expect(serviceMock.create).toHaveBeenCalledWith(dto, userId, organizationId);
    expect(result).toEqual({
      message: 'Usuario invitado exitosamente',
      data: {
        id: 'inv-1',
        professionalId: 'BIO-2026-AR-00001',
        email: dto.email,
        token: 'token-123',
        expiresAt: new Date('2026-03-01T00:00:00.000Z'),
      },
    });
  });

  it('create: should throw BadRequest if admin has no organization assigned', async () => {
    const dto = new CreateInvitationDto();
    dto.email = 'doctor@biotasys.com';
    dto.firstName = 'Juan';
    dto.lastName = 'Perez';
    dto.dni = '12345678Z';
    dto.role = Role.PROFESSIONAL;

    type CreateReq = Parameters<InvitationsController['create']>[0];
    const req = { user: { userId: '22222222-2222-2222-2222-222222222222' } } as
      unknown as CreateReq;

    await expect(controller.create(req, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('update: should call service.update(id, dto)', async () => {
    const dto = new UpdateInvitationDto();
    dto.status = InvitationStatus.ACCEPTED;

    const expected = { id: 'inv', status: InvitationStatus.ACCEPTED };
    serviceMock.update.mockResolvedValue(expected as never);

    const result = await controller.update('uuid', dto);

    expect(serviceMock.update).toHaveBeenCalledWith('uuid', dto);
    expect(result).toEqual(expected);
  });
});
