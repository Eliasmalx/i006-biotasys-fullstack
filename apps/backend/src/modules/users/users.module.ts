import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../../infrastructure/email/email.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

// Entidades
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Invitation } from '../invitations/entities/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, Invitation]),
    EmailModule,
    OrganizationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
