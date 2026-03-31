import { Module } from '@nestjs/common';
import { PasswordHashService } from './password-hash.service';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [UsersRepository, UsersService, PasswordHashService],
  exports: [UsersService, PasswordHashService],
})
export class UsersModule {}
