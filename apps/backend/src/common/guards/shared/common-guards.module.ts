import { Module } from '@nestjs/common';
import { OrganizationOwnershipGuard } from '../owner-ship/organization-ownership.guard';

/**
 * CommonGuardsModule
 * Exporta guards compartidos con todas sus dependencias resueltas
 * Evita dependencias circulares entre módulos
 */
@Module({
  providers: [OrganizationOwnershipGuard],
  exports: [OrganizationOwnershipGuard],
})
export class CommonGuardsModule {}
