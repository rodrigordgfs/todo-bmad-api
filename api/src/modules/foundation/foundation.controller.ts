import { Body, Controller, Get, Post } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

const foundationValidationSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
});

type FoundationValidationPayload = z.infer<typeof foundationValidationSchema>;

@Controller({ path: 'foundation', version: '1' })
export class FoundationController {
  @Post('validation')
  validatePayload(
    @Body(new ZodValidationPipe(foundationValidationSchema))
    body: FoundationValidationPayload,
  ) {
    return {
      title: body.title,
      valid: true,
    };
  }

  @Get('error')
  throwUnexpectedError() {
    throw new Error('Unexpected foundation error');
  }
}
