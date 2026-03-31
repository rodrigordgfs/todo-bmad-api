import { UsersRepository } from './repositories/users.repository';
import { PasswordHashService } from './password-hash.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  it('creates a user with passwordHash instead of raw password', async () => {
    const usersRepository = {
      create: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<UsersRepository, 'create'>;
    const passwordHashService = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      verify: jest.fn(),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;

    const service = new UsersService(
      usersRepository as UsersRepository,
      passwordHashService as PasswordHashService,
    );

    const result = await service.createUser({
      email: ' User@Example.com ',
      password: 'plain-password',
    });

    expect(passwordHashService.hash).toHaveBeenCalledWith('plain-password');
    expect(usersRepository.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    });
    expect(result).toEqual({
      id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
      email: 'user@example.com',
      createdAt: new Date('2026-03-31T10:00:00.000Z'),
      updatedAt: new Date('2026-03-31T10:00:00.000Z'),
    });
  });

  it('delegates user lookup by normalized email to the repository', async () => {
    const usersRepository = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<UsersRepository, 'findByEmail'>;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn(),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;

    const service = new UsersService(
      usersRepository as UsersRepository,
      passwordHashService as PasswordHashService,
    );

    await expect(service.findByEmail(' User@Example.com ')).resolves.toEqual({
      id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
      email: 'user@example.com',
      createdAt: new Date('2026-03-31T10:00:00.000Z'),
      updatedAt: new Date('2026-03-31T10:00:00.000Z'),
    });
    expect(usersRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('returns credential-bearing user lookup for future auth flows', async () => {
    const usersRepository = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
        email: 'user@example.com',
        passwordHash: 'hashed-password',
        createdAt: new Date('2026-03-31T10:00:00.000Z'),
        updatedAt: new Date('2026-03-31T10:00:00.000Z'),
      }),
    } satisfies Pick<UsersRepository, 'findByEmail'>;
    const passwordHashService = {
      hash: jest.fn(),
      verify: jest.fn(),
    } satisfies Pick<PasswordHashService, 'hash' | 'verify'>;

    const service = new UsersService(
      usersRepository as UsersRepository,
      passwordHashService as PasswordHashService,
    );

    await expect(
      service.findUserCredentialsByEmail(' User@Example.com '),
    ).resolves.toEqual({
      id: 'd98f6daf-4d44-4fd2-a56e-074f93d25a42',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2026-03-31T10:00:00.000Z'),
      updatedAt: new Date('2026-03-31T10:00:00.000Z'),
    });
    expect(usersRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
  });
});
