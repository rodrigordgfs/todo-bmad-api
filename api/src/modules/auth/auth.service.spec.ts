import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
import { RefreshTokenSessionsRepository } from './repositories/refresh-token-sessions.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('registers a new account and returns a safe response payload', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<UsersService, 'findByEmail' | 'createUser'>;

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
      rotateActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      'replaceActiveSession' | 'rotateActiveSession' | 'revokeActiveSession'
    >;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
    );

    await expect(
      service.register({
        email: ' User@Example.com ',
        password: 'plain-password',
      }),
    ).resolves.toEqual({
      id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
      email: 'user@example.com',
      createdAt: '2026-03-31T10:00:00.000Z',
      updatedAt: '2026-03-31T10:00:00.000Z',
    });

    expect(usersService.findByEmail).toHaveBeenCalledWith(' User@Example.com ');
    expect(usersService.createUser).toHaveBeenCalledWith({
      email: ' User@Example.com ',
      password: 'plain-password',
    });
  });

  it('rejects duplicated email with ConflictException', async () => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
      createUser: jest.fn(),
    } satisfies Pick<UsersService, 'findByEmail' | 'createUser'>;

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
      rotateActiveSession: jest.fn(),
      revokeActiveSession: jest.fn(),
    } satisfies Pick<
      RefreshTokenSessionsRepository,
      'replaceActiveSession' | 'rotateActiveSession' | 'revokeActiveSession'
    >;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
      refreshTokenSessionsRepository as RefreshTokenSessionsRepository,
    );

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow(ConflictException);
    expect(usersService.createUser).not.toHaveBeenCalled();
  });
});
