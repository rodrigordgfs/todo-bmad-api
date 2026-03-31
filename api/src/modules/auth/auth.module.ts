import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenSessionsRepository],
})
export class AuthModule {}
