import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from './entities/auth.entity';
import { JwtStrategy } from '../../common/guards/jwt-guards';
import { UsersModule } from '../users/users.module';
import config from '../../config/dotenv.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: config.jwtSecret,
      signOptions: { expiresIn: parseInt(config.jwtExpiresIn, 10) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, TypeOrmModule],
})
export class AuthModule {}
