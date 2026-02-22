import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../../infrastructure/email/email.module';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, User, Invitation]),
    EmailModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [TypeOrmModule, OrganizationsService],
})
export class OrganizationsModule {}
