import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Invitation } from '../invitations/entities/invitation.entity';
import { JwtStrategy } from '../../common/guards/jwt-guards';
import config from '../../config/dotenv.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Invitation]),
    PassportModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: config.jwtExpiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, TypeOrmModule],
})
export class AuthModule {}
