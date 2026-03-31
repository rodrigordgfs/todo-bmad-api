import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    title: z.string().trim().min(1, 'title is required'),
  });

  it('returns parsed payload when schema is valid', () => {
    const pipe = new ZodValidationPipe(schema);

    const result = pipe.transform(
      { title: 'Task title' },
      { type: 'body', data: '' },
    );

    expect(result).toEqual({ title: 'Task title' });
  });

  it('throws BadRequestException with normalized details when schema is invalid', () => {
    const pipe = new ZodValidationPipe(schema);

    let thrownError: BadRequestException | undefined;

    try {
      pipe.transform({ title: '' }, { type: 'body', data: '' });
    } catch (error) {
      thrownError = error as BadRequestException;
    }

    expect(thrownError).toBeInstanceOf(BadRequestException);
    expect(thrownError?.getResponse()).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: [
        {
          field: 'title',
          message: 'title is required',
          code: 'too_small',
        },
      ],
    });
  });
});
