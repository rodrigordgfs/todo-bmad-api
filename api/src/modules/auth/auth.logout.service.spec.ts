import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';
import { AuthService } from './auth.service';

describe('AuthService logout', () => {
  it('revokes a valid persisted refresh session', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn(),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(true),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-id',
        email: 'user@example.com',
        sid: 'session-id',
        type: 'refresh',
        exp: 1_775_564_800,
      }),
    } satisfies Pick<JwtService, 'verifyAsync'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn(),
      rotateActiveSession: jest.fn(),
      revokeActiveSession: jest
        .fn()
        .mockImplementation(
          async (
            input: { sessionId: string; userId: string; now: Date },
            verifyCurrentToken: (storedHash: string) => Promise<boolean>,
          ) => {
            const matches = await verifyCurrentToken('stored-hash');

            return matches
              ? {
                  id: input.sessionId,
                  userId: input.userId,
                  tokenHash: 'stored-hash',
                  expiresAt: new Date('2026-04-08T12:26:40.000Z'),
                  revokedAt: input.now,
                  createdAt: new Date('2026-03-31T12:00:00.000Z'),
                  updatedAt: new Date('2026-03-31T12:00:00.000Z'),
                }
              : null;
          },
        ),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      'replaceActiveSession' | 'rotateActiveSession' | 'revokeActiveSession'
    >;
    const prismaService = {
      $transaction: jest.fn(),
    } as Pick<PrismaService, '$transaction'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
      prismaService as PrismaService,
    );

    await expect(
      service.logout({
        refreshToken: 'refresh-token',
      }),
    ).resolves.toEqual({
      success: true,
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh-token', {
      secret: 'test-refresh-secret',
    });
    expect(
      refreshTokenSessionsRepository.revokeActiveSession,
    ).toHaveBeenCalledTimes(1);
    expect(passwordHashService.verify).toHaveBeenCalledWith(
      'stored-hash',
      'refresh-token',
    );
  });

  it('rejects invalid refresh token during logout', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn(),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn(),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid token')),
    } satisfies Pick<JwtService, 'verifyAsync'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn(),
      rotateActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      'replaceActiveSession' | 'rotateActiveSession' | 'revokeActiveSession'
    >;
    const prismaService = {
      $transaction: jest.fn(),
    } as Pick<PrismaService, '$transaction'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
      prismaService as PrismaService,
    );

    await expect(
      service.logout({
        refreshToken: 'invalid-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(
      refreshTokenSessionsRepository.revokeActiveSession,
    ).not.toHaveBeenCalled();
  });

  it('rejects logout when persisted session cannot be validated', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn(),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(false),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-id',
        email: 'user@example.com',
        sid: 'session-id',
        type: 'refresh',
        exp: 1_775_564_800,
      }),
    } satisfies Pick<JwtService, 'verifyAsync'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn(),
      rotateActiveSession: jest.fn(),
      revokeActiveSession: jest
        .fn()
        .mockImplementation(
          async (
            _input: { sessionId: string; userId: string; now: Date },
            verifyCurrentToken: (storedHash: string) => Promise<boolean>,
          ) => {
            const matches = await verifyCurrentToken('stored-hash');

            return matches
              ? {
                  id: 'session-id',
                  userId: 'user-id',
                  tokenHash: 'stored-hash',
                  expiresAt: new Date('2026-04-08T12:26:40.000Z'),
                  revokedAt: new Date('2026-03-31T12:30:00.000Z'),
                  createdAt: new Date('2026-03-31T12:00:00.000Z'),
                  updatedAt: new Date('2026-03-31T12:00:00.000Z'),
                }
              : null;
          },
        ),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      'replaceActiveSession' | 'rotateActiveSession' | 'revokeActiveSession'
    >;
    const prismaService = {
      $transaction: jest.fn(),
    } as Pick<PrismaService, '$transaction'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
      prismaService as PrismaService,
    );

    await expect(
      service.logout({
        refreshToken: 'refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
