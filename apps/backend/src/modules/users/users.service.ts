import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Listar usuarios de una organización
   * @param organizationId ID de la organización
   * @returns Lista de usuarios activos en la organización
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
   * Obtener usuario por ID
   * @param userId ID del usuario
   * @param organizationId ID de la organización (para validar permisos)
   * @returns Datos del usuario
   */
  async findOne(userId: string, organizationId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
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
        'updatedAt',
      ],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    return user;
  }

  /**
   * Actualizar datos de un usuario
   * @param userId ID del usuario
   * @param organizationId ID de la organización
   * @param dto Datos a actualizar (firstName, lastName, colegiadoNumber)
   * @returns Usuario actualizado
   */
  async update(userId: string, organizationId: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Validar que colegiadoNumber solo se actualiza para PROFESSIONAL y LAB_OPERATOR
    if (dto.colegiadoNumber) {
      if (user.role === Role.ADMIN) {
        throw new BadRequestException(
          'Los Administradores no pueden tener número de colegiado',
        );
      }
    }

    if (dto.firstName) user.firstName = dto.firstName.trim();
    if (dto.lastName) user.lastName = dto.lastName.trim();
    if (dto.colegiadoNumber) user.colegiadoNumber = dto.colegiadoNumber;

    await this.userRepository.save(user);

    // Retornar una vista saneada (sin campos sensibles como password)
    return await this.findOne(userId, organizationId);
  }

  /**
   * Desactivar un usuario
   * @param userId ID del usuario
   * @param organizationId ID de la organización
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
