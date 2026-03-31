import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { JwtPayload } from 'jsonwebtoken';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { LoginResponseContract } from './contracts/login-response.contract';
import { LogoutResponseContract } from './contracts/logout-response.contract';
import { RegisterResponseContract } from './contracts/register-response.contract';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHashService: PasswordHashService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenSessionsRepository: RefreshTokenSessionsRepository,
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

    return this.issueSessionTokens(user.id, user.email);
  }

  async refresh(refreshDto: RefreshDto): Promise<LoginResponseContract> {
    const payload = await this.verifyRefreshToken(refreshDto.refreshToken);

    if (!payload) {
      throw AuthService.invalidRefreshTokenException();
    }

    const rotatedTokens = await this.rotateSessionTokens(
      payload.sub,
      payload.email,
      payload.sid,
      refreshDto.refreshToken,
    );

    if (!rotatedTokens) {
      throw AuthService.invalidRefreshTokenException();
    }

    return rotatedTokens;
  }

  async logout(logoutDto: LogoutDto): Promise<LogoutResponseContract> {
    const payload = await this.verifyRefreshToken(logoutDto.refreshToken);

    if (!payload) {
      throw AuthService.invalidRefreshTokenException();
    }

    const revokedSession =
      await this.refreshTokenSessionsRepository.revokeActiveSession(
        {
          sessionId: payload.sid,
          userId: payload.sub,
          now: new Date(),
        },
        (storedHash) =>
          this.passwordHashService.verify(storedHash, logoutDto.refreshToken),
      );

    if (!revokedSession) {
      throw AuthService.invalidRefreshTokenException();
    }

    return {
      success: true,
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

  private static invalidRefreshTokenException() {
    return new UnauthorizedException({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid refresh token',
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

  private static hasExpiration(payload: unknown): payload is {
    exp: number;
  } {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'exp' in payload &&
      typeof payload.exp === 'number'
    );
  }

  private static hasRefreshClaims(payload: unknown): payload is JwtPayload & {
    sub: string;
    email: string;
    sid: string;
    type: 'refresh';
    exp: number;
  } {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      typeof payload.sub === 'string' &&
      'email' in payload &&
      typeof payload.email === 'string' &&
      'sid' in payload &&
      typeof payload.sid === 'string' &&
      'type' in payload &&
      payload.type === 'refresh' &&
      AuthService.hasExpiration(payload)
    );
  }

  private async verifyRefreshToken(refreshToken: string): Promise<
    | (JwtPayload & {
        sub: string;
        email: string;
        sid: string;
        type: 'refresh';
        exp: number;
      })
    | null
  > {
    let payload: JwtPayload | string;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: AuthService.getRequiredEnv('JWT_REFRESH_SECRET'),
      });
    } catch {
      return null;
    }

    if (!AuthService.hasRefreshClaims(payload)) {
      return null;
    }

    return payload;
  }

  private async issueSessionTokens(
    userId: string,
    email: string,
  ): Promise<LoginResponseContract> {
    const sessionId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
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
          sub: userId,
          email,
          type: 'refresh',
          sid: sessionId,
        },
        {
          secret: AuthService.getRequiredEnv('JWT_REFRESH_SECRET'),
          expiresIn: AuthService.getRequiredEnv(
            'JWT_REFRESH_EXPIRES_IN',
          ) as never,
        },
      ),
    ]);

    const refreshTokenPayload: unknown = this.jwtService.decode(refreshToken);

    if (!AuthService.hasExpiration(refreshTokenPayload)) {
      throw new Error('refresh token expiration is missing');
    }

    const refreshTokenHash = await this.passwordHashService.hash(refreshToken);

    await this.refreshTokenSessionsRepository.replaceActiveSession({
      sessionId,
      userId,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(refreshTokenPayload.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async rotateSessionTokens(
    userId: string,
    email: string,
    currentSessionId: string,
    currentRefreshToken: string,
  ): Promise<LoginResponseContract | null> {
    const now = new Date();
    const newSessionId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
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
          sub: userId,
          email,
          type: 'refresh',
          sid: newSessionId,
        },
        {
          secret: AuthService.getRequiredEnv('JWT_REFRESH_SECRET'),
          expiresIn: AuthService.getRequiredEnv(
            'JWT_REFRESH_EXPIRES_IN',
          ) as never,
        },
      ),
    ]);

    const refreshTokenPayload: unknown = this.jwtService.decode(refreshToken);

    if (!AuthService.hasExpiration(refreshTokenPayload)) {
      throw new Error('refresh token expiration is missing');
    }

    const newRefreshTokenHash =
      await this.passwordHashService.hash(refreshToken);

    const rotatedSession =
      await this.refreshTokenSessionsRepository.rotateActiveSession(
        {
          currentSessionId,
          userId,
          newSessionId,
          newTokenHash: newRefreshTokenHash,
          newExpiresAt: new Date(refreshTokenPayload.exp * 1000),
          now,
        },
        (storedHash) =>
          this.passwordHashService.verify(storedHash, currentRefreshToken),
      );

    if (!rotatedSession) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
