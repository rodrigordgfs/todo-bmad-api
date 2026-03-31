import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { RegisterResponseContract } from './contracts/register-response.contract';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseContract> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw AuthService.emailAlreadyExistsException();
    }

    try {
      const createdUser = await this.usersService.createUser(registerDto);

      return {
        id: createdUser.id,
        email: createdUser.email,
        createdAt: createdUser.createdAt.toISOString(),
        updatedAt: createdUser.updatedAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw AuthService.emailAlreadyExistsException();
      }

      throw error;
    }
  }

  private static emailAlreadyExistsException() {
    return new ConflictException({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already exists',
      details: [],
    });
  }
}
