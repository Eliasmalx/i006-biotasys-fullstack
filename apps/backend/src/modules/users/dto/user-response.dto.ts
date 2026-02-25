import { PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserListItemResponseDto extends PickType(User, [
  'id',
  'email',
  'firstName',
  'lastName',
  'role',
  'isActive',
  'professionalId',
  'colegiadoNumber',
  'createdAt',
] as const) {}

export class UserDetailResponseDto extends PickType(User, [
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
] as const) {}
