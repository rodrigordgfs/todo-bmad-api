import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  it('creates a protected hash different from the raw password', async () => {
    const service = new PasswordHashService();

    const passwordHash = await service.hash('super-secret-password');

    expect(passwordHash).not.toEqual('super-secret-password');
    expect(typeof passwordHash).toBe('string');
    expect(passwordHash.length).toBeGreaterThan(20);
  });

  it('verifies a valid password against the generated hash', async () => {
    const service = new PasswordHashService();
    const passwordHash = await service.hash('correct-password');

    await expect(
      service.verify(passwordHash, 'correct-password'),
    ).resolves.toBe(true);
  });

  it('rejects an invalid password for the generated hash', async () => {
    const service = new PasswordHashService();
    const passwordHash = await service.hash('correct-password');

    await expect(service.verify(passwordHash, 'wrong-password')).resolves.toBe(
      false,
    );
  });
});
