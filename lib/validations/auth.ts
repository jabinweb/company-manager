import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  isEmployee: z.boolean().optional().default(false)
});

export type LoginInput = z.infer<typeof loginSchema>;
