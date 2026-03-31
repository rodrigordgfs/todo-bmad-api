import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email({ message: 'email must be a valid email' }),
  password: z.string().min(6, 'password must contain at least 6 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
