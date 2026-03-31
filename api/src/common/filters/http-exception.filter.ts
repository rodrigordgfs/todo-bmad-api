import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ErrorResponseContract,
  ErrorResponseDetail,
} from '../../shared/contracts/error-response.contract';

type HttpExceptionResponse = {
  code?: string;
  message?: string | string[];
  details?: ErrorResponseDetail[];
  error?: string;
  statusCode?: number;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const errorResponse = this.normalizeException(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private normalizeException(exception: unknown): ErrorResponseContract {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
        details: [],
      };
    }

    const statusCode = exception.getStatus();
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return {
        statusCode,
        code: this.defaultCode(statusCode),
        message: response,
        details: [],
      };
    }

    const httpResponse = response as HttpExceptionResponse;
    const normalizedMessage = Array.isArray(httpResponse.message)
      ? httpResponse.message.join(', ')
      : (httpResponse.message ?? this.defaultMessage(statusCode));

    return {
      statusCode,
      code: httpResponse.code ?? this.defaultCode(statusCode),
      message: normalizedMessage,
      details: httpResponse.details ?? [],
    };
  }

  private defaultCode(statusCode: number) {
    if (statusCode === 400) {
      return 'BAD_REQUEST';
    }

    if (statusCode === 404) {
      return 'NOT_FOUND';
    }

    if (statusCode >= 500) {
      return 'INTERNAL_SERVER_ERROR';
    }

    return 'HTTP_ERROR';
  }

  private defaultMessage(statusCode: number) {
    if (statusCode === 400) {
      return 'Bad request';
    }

    if (statusCode === 404) {
      return 'Resource not found';
    }

    if (statusCode >= 500) {
      return 'Internal server error';
    }

    return 'Request failed';
  }
}
