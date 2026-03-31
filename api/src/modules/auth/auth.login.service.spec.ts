import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordHashService } from '../users/password-hash.service';
import { UsersService } from '../users/users.service';
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
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(true),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    } satisfies Pick<JwtService, 'signAsync'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
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
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      {
        sub: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        type: 'refresh',
      },
      expect.objectContaining({
        secret: 'test-refresh-secret',
        expiresIn: '7d',
      }),
    );
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
    } satisfies Pick<JwtService, 'signAsync'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
    );

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(passwordHashService.verify).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
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
    } satisfies Pick<JwtService, 'signAsync'>;

    const service = new AuthService(
      usersService as UsersService,
      passwordHashService as PasswordHashService,
      jwtService as JwtService,
    );

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
