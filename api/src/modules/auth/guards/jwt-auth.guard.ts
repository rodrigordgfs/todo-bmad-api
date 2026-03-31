import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { AuthenticatedUser } from '../types/authenticated-user.type';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw JwtAuthGuard.invalidAccessTokenException();
    }

    let payload: JwtPayload | string;

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: JwtAuthGuard.getRequiredEnv('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw JwtAuthGuard.invalidAccessTokenException();
    }

    if (!JwtAuthGuard.hasAccessClaims(payload)) {
      throw JwtAuthGuard.invalidAccessTokenException();
    }

    request.user = {
      userId: payload.sub,
      email: payload.email,
    };

    return true;
  }

  private extractBearerToken(
    request: AuthenticatedRequest,
  ): string | undefined {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return undefined;
    }

    return token;
  }

  private static hasAccessClaims(payload: unknown): payload is JwtPayload & {
    sub: string;
    email: string;
    type: 'access';
  } {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'sub' in payload &&
      typeof payload.sub === 'string' &&
      'email' in payload &&
      typeof payload.email === 'string' &&
      'type' in payload &&
      payload.type === 'access'
    );
  }

  private static getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`${name} is not set`);
    }

    return value;
  }

  private static invalidAccessTokenException() {
    return new UnauthorizedException({
      code: 'INVALID_ACCESS_TOKEN',
      message: 'Invalid access token',
      details: [],
    });
  }
}
