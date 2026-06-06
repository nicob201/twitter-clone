import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { getPrisma } from '../../shared/db/prisma.js';
import { AppError } from '../../shared/errors/index.js';
import { signToken } from '../../shared/auth/jwt.js';
import type { AuthResponse, UserProfile } from './auth.types.js';
import type { RegisterInput, LoginInput } from './auth.schemas.js';

const SALT_ROUNDS = 12;

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const prisma = getPrisma();

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    const token = signToken({ userId: user.id });

    return { user, token };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta as { target?: string[] } | undefined)?.target ?? [];

      if (target.includes('email')) {
        throw new AppError('Email already in use', 409);
      }

      if (target.includes('username')) {
        throw new AppError('Username already in use', 409);
      }
    }

    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    token,
  };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
