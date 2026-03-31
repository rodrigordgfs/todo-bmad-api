import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import { PrismaService } from '../../../infra/database/prisma/prisma.service';

type CreateRefreshTokenSessionInput = {
  sessionId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type RotateRefreshTokenSessionInput = {
  currentSessionId: string;
  userId: string;
  newSessionId: string;
  newTokenHash: string;
  newExpiresAt: Date;
  now: Date;
};

type RevokeRefreshTokenSessionInput = {
  sessionId: string;
  userId: string;
  now: Date;
};

@Injectable()
export class RefreshTokenSessionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async replaceActiveSession(
    input: CreateRefreshTokenSessionInput,
  ): Promise<RefreshToken> {
    const now = new Date();

    return this.prismaService.$transaction(async (prisma) => {
      await prisma.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${input.userId}))
      `;

      await prisma.refreshToken.updateMany({
        where: {
          userId: input.userId,
          revokedAt: null,
        },
        data: {
          revokedAt: now,
        },
      });

      return prisma.refreshToken.create({
        data: {
          id: input.sessionId,
          userId: input.userId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      });
    });
  }

  async findById(sessionId: string): Promise<RefreshToken | null> {
    return this.prismaService.refreshToken.findUnique({
      where: {
        id: sessionId,
      },
    });
  }

  async findActiveByIdAndUserId(
    sessionId: string,
    userId: string,
    now: Date,
  ): Promise<RefreshToken | null> {
    return this.prismaService.refreshToken.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });
  }

  async rotateActiveSession(
    input: RotateRefreshTokenSessionInput,
    verifyCurrentToken: (storedHash: string) => Promise<boolean>,
  ): Promise<RefreshToken | null> {
    return this.prismaService.$transaction(async (prisma) => {
      await prisma.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${input.userId}))
      `;

      const currentSession = await prisma.refreshToken.findFirst({
        where: {
          id: input.currentSessionId,
          userId: input.userId,
          revokedAt: null,
          expiresAt: {
            gt: input.now,
          },
        },
      });

      if (!currentSession) {
        return null;
      }

      const tokenMatches = await verifyCurrentToken(currentSession.tokenHash);

      if (!tokenMatches) {
        return null;
      }

      await prisma.refreshToken.update({
        where: {
          id: currentSession.id,
        },
        data: {
          revokedAt: input.now,
        },
      });

      return prisma.refreshToken.create({
        data: {
          id: input.newSessionId,
          userId: input.userId,
          tokenHash: input.newTokenHash,
          expiresAt: input.newExpiresAt,
        },
      });
    });
  }

  async revokeActiveSession(
    input: RevokeRefreshTokenSessionInput,
    verifyCurrentToken: (storedHash: string) => Promise<boolean>,
  ): Promise<RefreshToken | null> {
    return this.prismaService.$transaction(async (prisma) => {
      await prisma.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${input.userId}))
      `;

      const currentSession = await prisma.refreshToken.findFirst({
        where: {
          id: input.sessionId,
          userId: input.userId,
          revokedAt: null,
          expiresAt: {
            gt: input.now,
          },
        },
      });

      if (!currentSession) {
        return null;
      }

      const tokenMatches = await verifyCurrentToken(currentSession.tokenHash);

      if (!tokenMatches) {
        return null;
      }

      return prisma.refreshToken.update({
        where: {
          id: currentSession.id,
        },
        data: {
          revokedAt: input.now,
        },
      });
    });
  }
}
