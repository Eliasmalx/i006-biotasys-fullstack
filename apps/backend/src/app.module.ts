import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { winstonConfig } from './config/winston.config';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
    InvitationsModule,
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
