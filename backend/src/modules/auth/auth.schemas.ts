import { z } from 'zod';

const emailTransform = z
  .string()
  .email('Invalid email')
  .transform((v) => v.trim().toLowerCase());
const passwordRegister = z.string().min(8, 'Password must be at least 8 characters');

export const registerSchema = z.object({
  email: emailTransform,
  username: z
    .string()
    .min(1, 'Username is required')
    .transform((v) => v.trim().toLowerCase()),
  password: passwordRegister,
});

export const loginSchema = z.object({
  email: emailTransform,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
