import { PrismaService } from '../../../infra/database/prisma/prisma.service';
import { RefreshTokenSessionsRepository } from './refresh-token-sessions.repository';

describe('RefreshTokenSessionsRepository', () => {
  it('revokes active sessions and creates a new one in a transaction', async () => {
    type RefreshTokenRecord = {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      revokedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };

    const updateMany = jest
      .fn<() => Promise<{ count: number }>>()
      .mockResolvedValue({ count: 1 });
    const create = jest
      .fn<() => Promise<RefreshTokenRecord>>()
      .mockResolvedValue({
        id: 'session-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-04-07T12:00:00.000Z'),
        revokedAt: null,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
        updatedAt: new Date('2026-03-31T12:00:00.000Z'),
      });
    type TransactionClient = {
      $executeRaw: typeof executeRaw;
      refreshToken: {
        updateMany: typeof updateMany;
        create: typeof create;
      };
    };
    const executeRaw = jest.fn<() => Promise<number>>().mockResolvedValue(1);
    const transactionClient: TransactionClient = {
      $executeRaw: executeRaw,
      refreshToken: {
        updateMany,
        create,
      },
    };
    const prismaService = {
      $transaction: jest
        .fn()
        .mockImplementation(
          (
            callback: (
              prisma: TransactionClient,
            ) => Promise<RefreshTokenRecord> | RefreshTokenRecord,
          ) => Promise.resolve(callback(transactionClient)),
        ),
      refreshToken: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const repository = new RefreshTokenSessionsRepository(prismaService);

    const result = await repository.replaceActiveSession({
      sessionId: 'session-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date('2026-04-07T12:00:00.000Z'),
    });

    const updateManyCall = updateMany.mock.calls[0] as [
      {
        where: {
          userId: string;
          revokedAt: null;
        };
        data: {
          revokedAt: Date;
        };
      },
    ];

    expect(updateManyCall[0].where).toEqual({
      userId: 'user-id',
      revokedAt: null,
    });
    expect(updateManyCall[0].data.revokedAt).toBeInstanceOf(Date);
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'session-id',
        userId: 'user-id',
        tokenHash: 'hashed-token',
        expiresAt: new Date('2026-04-07T12:00:00.000Z'),
      },
    });
    expect(result.id).toBe('session-id');
  });

  it('finds only active non-expired sessions for a user', async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      tokenHash: 'hashed-token',
      expiresAt: new Date('2026-04-07T12:00:00.000Z'),
      revokedAt: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    const prismaService = {
      $transaction: jest.fn(),
      refreshToken: {
        findUnique: jest.fn(),
        findFirst,
      },
    } as unknown as PrismaService;

    const repository = new RefreshTokenSessionsRepository(prismaService);
    const now = new Date('2026-04-01T12:00:00.000Z');

    await repository.findActiveByIdAndUserId('session-id', 'user-id', now);

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'session-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });
  });

  it('rotates the current active session under a user lock', async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: 'current-session-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date('2026-04-07T12:00:00.000Z'),
      revokedAt: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    const update = jest.fn().mockResolvedValue(undefined);
    const create = jest.fn().mockResolvedValue({
      id: 'new-session-id',
      userId: 'user-id',
      tokenHash: 'new-hash',
      expiresAt: new Date('2026-04-08T12:00:00.000Z'),
      revokedAt: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    const executeRaw = jest.fn<() => Promise<number>>().mockResolvedValue(1);
    const prismaService = {
      $transaction: jest.fn().mockImplementation(
        (
          callback: (prisma: {
            $executeRaw: typeof executeRaw;
            refreshToken: {
              findFirst: typeof findFirst;
              update: typeof update;
              create: typeof create;
            };
          }) => Promise<unknown>,
        ) =>
          callback({
            $executeRaw: executeRaw,
            refreshToken: {
              findFirst,
              update,
              create,
            },
          }),
      ),
      refreshToken: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const repository = new RefreshTokenSessionsRepository(prismaService);
    const verifyCurrentToken = jest.fn().mockResolvedValue(true);
    const now = new Date('2026-04-01T12:00:00.000Z');

    await repository.rotateActiveSession(
      {
        currentSessionId: 'current-session-id',
        userId: 'user-id',
        newSessionId: 'new-session-id',
        newTokenHash: 'new-hash',
        newExpiresAt: new Date('2026-04-08T12:00:00.000Z'),
        now,
      },
      verifyCurrentToken,
    );

    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'current-session-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });
    expect(verifyCurrentToken).toHaveBeenCalledWith('stored-hash');
    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'current-session-id',
      },
      data: {
        revokedAt: now,
      },
    });
    expect(create).toHaveBeenCalledWith({
      data: {
        id: 'new-session-id',
        userId: 'user-id',
        tokenHash: 'new-hash',
        expiresAt: new Date('2026-04-08T12:00:00.000Z'),
      },
    });
  });

  it('revokes the current active session under a user lock', async () => {
    const findFirst = jest.fn().mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date('2026-04-07T12:00:00.000Z'),
      revokedAt: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    const update = jest.fn().mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date('2026-04-07T12:00:00.000Z'),
      revokedAt: new Date('2026-04-01T12:00:00.000Z'),
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
      updatedAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    const executeRaw = jest.fn<() => Promise<number>>().mockResolvedValue(1);
    const prismaService = {
      $transaction: jest.fn().mockImplementation(
        (
          callback: (prisma: {
            $executeRaw: typeof executeRaw;
            refreshToken: {
              findFirst: typeof findFirst;
              update: typeof update;
            };
          }) => Promise<unknown>,
        ) =>
          callback({
            $executeRaw: executeRaw,
            refreshToken: {
              findFirst,
              update,
            },
          }),
      ),
      refreshToken: {
        findUnique: jest.fn(),
      },
    } as unknown as PrismaService;

    const repository = new RefreshTokenSessionsRepository(prismaService);
    const verifyCurrentToken = jest.fn().mockResolvedValue(true);
    const now = new Date('2026-04-01T12:00:00.000Z');

    await repository.revokeActiveSession(
      {
        sessionId: 'session-id',
        userId: 'user-id',
        now,
      },
      verifyCurrentToken,
    );

    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'session-id',
        userId: 'user-id',
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });
    expect(verifyCurrentToken).toHaveBeenCalledWith('stored-hash');
    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'session-id',
      },
      data: {
        revokedAt: now,
      },
    });
  });
});
