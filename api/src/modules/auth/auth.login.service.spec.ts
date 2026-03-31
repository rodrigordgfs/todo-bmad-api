import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/database/prisma/prisma.service';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';
import { AuthService } from './auth.service';

describe('AuthService login', () => {
  it('authenticates a valid user and returns access and refresh tokens', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        passwordHash: 'stored-hash',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn().mockResolvedValue('hashed-refresh-token'),
      verify: jest.fn().mockResolvedValue(true),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
      decode: jest.fn().mockReturnValue({
        exp: 1_775_564_800,
      }),
    } satisfies Pick<JwtService, 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn().mockResolvedValue(undefined),
    } satisfies Pick<RefreshTokenSessionsRepository, 'replaceActiveSession'>;
    const transactionClient = {
      task: {
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    const prismaService = {
      $transaction: jest
        .fn()
        .mockImplementation(
          (callback: (tx: typeof transactionClient) => Promise<unknown>) =>
            callback(transactionClient),
        ),
    } as Pick<PrismaService, '$transaction'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
      prismaService as PrismaService,
    );

    await expect(
      service.login({
        email: ' User@Example.com ',
        password: 'plain-password',
      }),
    ).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(usersService.findUserCredentialsByEmail).toHaveBeenCalledWith(
      ' User@Example.com ',
    );
    expect(passwordHashService.verify).toHaveBeenCalledWith(
      'stored-hash',
      'plain-password',
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      {
        sub: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        type: 'access',
      },
      expect.objectContaining({
        secret: 'test-access-secret',
        expiresIn: '15m',
      }),
    );
    const refreshTokenCall = jwtService.signAsync.mock.calls[1] as [
      {
        sub: string;
        email: string;
        type: string;
        sid: string;
      },
      {
        secret: string;
        expiresIn: string;
      },
    ];

    expect(refreshTokenCall[0].sub).toBe(
      'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
    );
    expect(refreshTokenCall[0].email).toBe('user@example.com');
    expect(refreshTokenCall[0].type).toBe('refresh');
    expect(refreshTokenCall[0].sid).toEqual(expect.any(String));
    expect(refreshTokenCall[1]).toEqual(
      expect.objectContaining({
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      }),
    );
    expect(passwordHashService.hash).toHaveBeenCalledWith('refresh-token');
    const replaceSessionCall = refreshTokenSessionsRepository
      .replaceActiveSession.mock.calls[0] as [
      {
        sessionId: string;
        userId: string;
        tokenHash: string;
        expiresAt: Date;
      },
    ];

    expect(replaceSessionCall[0].sessionId).toEqual(expect.any(String));
    expect(replaceSessionCall[0].userId).toBe(
      'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
    );
    expect(replaceSessionCall[0].tokenHash).toBe('hashed-refresh-token');
    expect(replaceSessionCall[0].expiresAt).toEqual(
      new Date('2026-04-07T12:26:40.000Z'),
    );
    expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown user with UnauthorizedException', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn().mockResolvedValue(null),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn(),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    } satisfies Pick<JwtService, 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn(),
    } satisfies Pick<RefreshTokenSessionsRepository, 'replaceActiveSession'>;
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
      service.login({
        email: 'user@example.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(passwordHashService.verify).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(
      refreshTokenSessionsRepository.replaceActiveSession,
    ).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });

  it('rejects wrong password with UnauthorizedException', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        passwordHash: 'stored-hash',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(false),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      signAsync: jest.fn(),
      decode: jest.fn(),
    } satisfies Pick<JwtService, 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      replaceActiveSession: jest.fn(),
    } satisfies Pick<RefreshTokenSessionsRepository, 'replaceActiveSession'>;
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
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(
      refreshTokenSessionsRepository.replaceActiveSession,
    ).not.toHaveBeenCalled();
    expect(prismaService.$transaction).not.toHaveBeenCalled();
  });
});
