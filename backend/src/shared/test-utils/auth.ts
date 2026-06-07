import request from 'supertest';
import type { Application } from 'express';

export async function setupTestApp(): Promise<Application> {
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-32chars';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  const { createApp } = await import('../../app/app.js');
  return createApp();
}

export async function registerUser(app: Application): Promise<string> {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'auth@example.com', username: 'authuser', password: 'password123' });

  return (res.body as { data: { token: string } }).data.token;
}
