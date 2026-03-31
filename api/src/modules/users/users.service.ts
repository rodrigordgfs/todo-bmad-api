import { Injectable } from '@nestjs/common';
import { PasswordHashService } from './password-hash.service';
import { UsersRepository } from './repositories/users.repository';
import { UserPersistence } from './types/user-persistence.type';
import { User } from './types/user.type';

type CreateUserInput = {
  email: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const normalizedEmail = UsersService.normalizeEmail(input.email);
    const passwordHash = await this.passwordHashService.hash(input.password);

    const createdUser = await this.usersRepository.create({
      email: normalizedEmail,
      passwordHash,
    });

    return UsersService.toUser(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findByEmail(
      UsersService.normalizeEmail(email),
    );

    return user ? UsersService.toUser(user) : null;
  }

  async findUserCredentialsByEmail(
    email: string,
  ): Promise<UserPersistence | null> {
    return this.usersRepository.findByEmail(UsersService.normalizeEmail(email));
  }

  private static normalizeEmail(email: string): string {
    return email.trim().toLocaleLowerCase();
  }

  private static toUser(user: UserPersistence): User {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
