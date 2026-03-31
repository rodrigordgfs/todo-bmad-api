import { z } from 'zod';

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

export type RefreshSchema = z.infer<typeof refreshSchema>;
