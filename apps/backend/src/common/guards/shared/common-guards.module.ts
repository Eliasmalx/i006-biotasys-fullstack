import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { OrganizationOwnershipGuard } from '../owner-ship/organization-ownership.guard';

/**
 * CommonGuardsModule
 * Exporta guards compartidos con todas sus dependencias resueltas
 * Evita dependencias circulares entre módulos
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [OrganizationOwnershipGuard],
  exports: [OrganizationOwnershipGuard, TypeOrmModule],
})
export class CommonGuardsModule {}
