import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { ZodError, ZodType } from 'zod';
import { ErrorResponseDetail } from '../../shared/contracts/error-response.contract';

export class ZodValidationPipe<TOutput> implements PipeTransform<
  unknown,
  TOutput
> {
  constructor(private readonly schema: ZodType<TOutput>) {}

  transform(value: unknown, metadata: ArgumentMetadata): TOutput {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: this.mapIssues(error, metadata),
        });
      }

      throw error;
    }
  }

  private mapIssues(
    error: ZodError,
    metadata: ArgumentMetadata,
  ): ErrorResponseDetail[] {
    return error.issues.map((issue) => ({
      field:
        issue.path.join('.') || metadata.data || metadata.type || 'request',
      message: issue.message,
      code: issue.code,
    }));
  }
}
