import {
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  function createArgumentsHost() {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({
          status,
          json,
        }),
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  }

  it('normalizes HttpException responses', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createArgumentsHost();

    filter.catch(
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [{ field: 'title', message: 'required', code: 'too_small' }],
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [{ field: 'title', message: 'required', code: 'too_small' }],
    });
  });

  it('normalizes unexpected exceptions without leaking internals', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createArgumentsHost();

    filter.catch(new Error('database exploded'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: [],
    });
  });

  it('provides stable defaults for unauthorized exceptions without explicit code', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createArgumentsHost();

    filter.catch(new UnauthorizedException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
      details: [],
    });
  });

  it('provides stable defaults for conflict exceptions without explicit code', () => {
    const filter = new HttpExceptionFilter();
    const { host, status, json } = createArgumentsHost();

    filter.catch(new ConflictException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      code: 'CONFLICT',
      message: 'Conflict',
      details: [],
    });
  });
});
