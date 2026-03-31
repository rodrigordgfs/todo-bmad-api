import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { LoginResponseContract } from './contracts/login-response.contract';
import { RegisterResponseContract } from './contracts/register-response.contract';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(loginDto: LoginDto): Promise<LoginResponseContract> {
    const user = await this.usersService.findUserCredentialsByEmail(
      loginDto.email,
    );

    if (!user) {
      throw AuthService.invalidCredentialsException();
    }

    const passwordMatches = await this.passwordHashService.verify(
      user.passwordHash,
      loginDto.password,
    );

    if (!passwordMatches) {
      throw AuthService.invalidCredentialsException();
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'access',
        },
        {
          secret: AuthService.getRequiredEnv('JWT_ACCESS_SECRET'),
          expiresIn: AuthService.getRequiredEnv(
            'JWT_ACCESS_EXPIRES_IN',
          ) as never,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'refresh',
        },
        {
          secret: AuthService.getRequiredEnv('JWT_REFRESH_SECRET'),
          expiresIn: AuthService.getRequiredEnv(
            'JWT_REFRESH_EXPIRES_IN',
          ) as never,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private static emailAlreadyExistsException() {
    return new ConflictException({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email already exists',
      details: [],
    });
  }

  private static invalidCredentialsException() {
    return new UnauthorizedException({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
      details: [],
    });
  }

  private static getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`${name} is not set`);
    }

    return value;
  }
}
