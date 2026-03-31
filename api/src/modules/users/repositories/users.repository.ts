import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { UserPersistence } from '../types/user-persistence.type';

type CreateUserPersistenceInput = {
  email: string;
  passwordHash: string;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserPersistenceInput): Promise<UserPersistence> {
    return this.prismaService.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
      },
    });
  }

  async findByEmail(email: string): Promise<UserPersistence | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }
}
