import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { DevController } from './dev.controller';

/**
 * ⚠️ MÓDULO SOLO PARA DESARROLLO
 * Proporciona endpoints útiles para testing y setup local
 * 
 * IMPORTANTE: No debe ser usado en producción
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DevController],
})
export class DevModule {}
