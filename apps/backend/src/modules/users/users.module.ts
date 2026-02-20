import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../../infrastructure/email/email.module';

// Servicios
import { UsersService } from './services/users.service';
import { SuperadminUsersService } from './services/superadmin-users.service';
import { AdminUsersService } from './services/admin-users.service';

// Controladores
// import { UsersController } from './controllers/users.controller';
import { SuperadminUsersController } from './controllers/superadmin-users.controller';
import { AdminUsersController } from './controllers/admin-users.controller';

// Entidades
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Invitation } from '../invitations/entities/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, Invitation]),
    EmailModule,
  ],
  controllers: [
    // UsersController,
    SuperadminUsersController,
    AdminUsersController,
  ],
  providers: [UsersService, SuperadminUsersService, AdminUsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
