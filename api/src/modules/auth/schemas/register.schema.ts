import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email({ message: 'email must be a valid email' }),
  password: z.string().min(6, 'password must contain at least 6 characters'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
