import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { Invitation } from './entities/invitation.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../../infrastructure/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation, Organization]),
    UsersModule,
    EmailModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [TypeOrmModule],
})
export class InvitationsModule {}
