import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './infrastructure/email/email.module';
import { DevModule } from './dev/dev.module';
import { winstonConfig } from './config/winston.config';
import { ormConfig } from './config/orm.config';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PatiensModule } from './modules/patients/patients.module';
import { CommonGuardsModule } from './common/guards/shared/common-guards.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
    EmailModule,
    InvitationsModule,
    OrganizationsModule,
    DevModule,
    PatiensModule,
    CommonGuardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
