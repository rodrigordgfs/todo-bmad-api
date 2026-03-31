import { z } from 'zod';

export const listTasksQuerySchema = z
  .object({
    status: z.enum(['all', 'open', 'completed']).optional(),
    search: z
      .string()
      .transform((value) => value.trim())
      .transform((value) => (value === '' ? undefined : value))
      .optional(),
  })
  .strict();

export type ListTasksQuerySchema = z.infer<typeof listTasksQuerySchema>;
