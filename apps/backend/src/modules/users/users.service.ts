import {
  Injectable,
  NotFoundException,
  Logger,
  // BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Listar usuarios usando los nuevos campos de la entidad
   */
  async listByOrganization(organizationId: string) {
    return await this.userRepository.find({
      where: { organizationId },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'professionalId',
        'colegiadoNumber',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Actualizar usuario mapeando firstName y lastName
   */
  async update(userId: string, organizationId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.firstName) user.firstName = dto.firstName.trim();
    if (dto.lastName) user.lastName = dto.lastName.trim();
    if (dto.colegiadoNumber) user.colegiadoNumber = dto.colegiadoNumber;

    return await this.userRepository.save(user);
  }

  /**
   * Desactivación lógica usando el campo isActive
   */
  async deactivate(userId: string, organizationId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.isActive = false;
    await this.userRepository.save(user);
    this.logger.log(`Usuario ${user.email} desactivado`);
  }
}
