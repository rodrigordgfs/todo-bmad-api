import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';
import { AuthService } from './auth.service';

describe('AuthService refresh', () => {
  type RotateActiveSessionInput = {
    currentSessionId: string;
    userId: string;
    newSessionId: string;
    newTokenHash: string;
    newExpiresAt: Date;
    now: Date;
  };

  it('rotates credentials for a valid refresh token', async () => {
    const usersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
      findUserCredentialsByEmail: jest.fn(),
    } satisfies Pick<
      UsersService,
      'findByEmail' | 'createUser' | 'findUserCredentialsByEmail'
    >;
    const passwordHashService = {
      hash: jest.fn().mockResolvedValue('new-refresh-token-hash'),
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
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token'),
      decode: jest.fn().mockReturnValue({
        exp: 1_775_651_200,
      }),
    } satisfies Pick<JwtService, 'verifyAsync' | 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      findActiveByIdAndUserId: jest.fn(),
      replaceActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
      rotateActiveSession: jest
        .fn()
        .mockImplementation(
          async (
            input: RotateActiveSessionInput,
            verifyCurrentToken: (storedHash: string) => Promise<boolean>,
          ) => {
            const matches = await verifyCurrentToken('stored-hash');

            if (!matches) {
              return null;
            }

            return {
              id: input.newSessionId,
              userId: input.userId,
              tokenHash: input.newTokenHash,
              expiresAt: input.newExpiresAt,
              revokedAt: null,
              createdAt: new Date('2026-03-31T12:00:00.000Z'),
              updatedAt: new Date('2026-03-31T12:00:00.000Z'),
            };
          },
        ),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      | 'findActiveByIdAndUserId'
      | 'replaceActiveSession'
      | 'revokeActiveSession'
      | 'rotateActiveSession'
    >;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
    );

    await expect(
      service.refresh({
        refreshToken: 'old-refresh-token',
      }),
    ).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('old-refresh-token', {
      secret: 'test-refresh-secret',
    });
    expect(
      refreshTokenSessionsRepository.rotateActiveSession,
    ).toHaveBeenCalledTimes(1);
    expect(passwordHashService.verify).toHaveBeenCalledWith(
      'stored-hash',
      'old-refresh-token',
    );
    const rotateSessionCall = refreshTokenSessionsRepository.rotateActiveSession
      .mock.calls[0] as [
      {
        currentSessionId: string;
        userId: string;
        newSessionId: string;
        newTokenHash: string;
        newExpiresAt: Date;
        now: Date;
      },
    ];

    expect(rotateSessionCall[0].currentSessionId).toBe('session-id');
    expect(rotateSessionCall[0].newSessionId).toEqual(expect.any(String));
    expect(rotateSessionCall[0].userId).toBe('user-id');
    expect(rotateSessionCall[0].newTokenHash).toBe('new-refresh-token-hash');
    expect(rotateSessionCall[0].newExpiresAt).toEqual(
      new Date('2026-04-08T12:26:40.000Z'),
    );
  });

  it('rejects refresh token without a valid persisted session', async () => {
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
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-id',
        email: 'user@example.com',
        sid: 'session-id',
        type: 'refresh',
        exp: 1_775_564_800,
      }),
      signAsync: jest.fn(),
      decode: jest.fn().mockReturnValue({
        exp: 1_775_651_200,
      }),
    } satisfies Pick<JwtService, 'verifyAsync' | 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      findActiveByIdAndUserId: jest.fn(),
      replaceActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
      rotateActiveSession: jest.fn().mockResolvedValue(null),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      | 'findActiveByIdAndUserId'
      | 'replaceActiveSession'
      | 'revokeActiveSession'
      | 'rotateActiveSession'
    >;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
    );

    await expect(
      service.refresh({
        refreshToken: 'old-refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(passwordHashService.verify).not.toHaveBeenCalled();
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(
      refreshTokenSessionsRepository.rotateActiveSession,
    ).toHaveBeenCalled();
  });

  it('rejects refresh token when persisted hash does not match', async () => {
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
      signAsync: jest.fn(),
      decode: jest.fn().mockReturnValue({
        exp: 1_775_651_200,
      }),
    } satisfies Pick<JwtService, 'verifyAsync' | 'signAsync' | 'decode'>;
    const refreshTokenSessionsRepository = {
      findActiveByIdAndUserId: jest.fn(),
      replaceActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
      rotateActiveSession: jest
        .fn()
        .mockImplementation(
          async (
            input: RotateActiveSessionInput,
            verifyCurrentToken: (storedHash: string) => Promise<boolean>,
          ) => {
            const matches = await verifyCurrentToken('stored-hash');

            return matches
              ? {
                  id: input.newSessionId,
                  userId: input.userId,
                  tokenHash: input.newTokenHash,
                  expiresAt: input.newExpiresAt,
                  revokedAt: null,
                  createdAt: new Date('2026-03-31T12:00:00.000Z'),
                  updatedAt: new Date('2026-03-31T12:00:00.000Z'),
                }
              : null;
          },
        ),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      | 'findActiveByIdAndUserId'
      | 'replaceActiveSession'
      | 'revokeActiveSession'
      | 'rotateActiveSession'
    >;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
    );

    await expect(
      service.refresh({
        refreshToken: 'old-refresh-token',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    expect(
      refreshTokenSessionsRepository.rotateActiveSession,
    ).toHaveBeenCalled();
  });
});
