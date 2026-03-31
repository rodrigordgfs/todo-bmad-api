import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordHashService],
})
export class AuthModule {}
