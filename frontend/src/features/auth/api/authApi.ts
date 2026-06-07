import { apiClient } from '../../../shared/api/client.js';
import type { AuthResponse, CurrentUser } from '../types/auth.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/login', {
    email,
    password,
  });
  return res.data.data;
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await apiClient.post<ApiEnvelope<AuthResponse>>('/auth/register', {
    email,
    username,
    password,
  });
  return res.data.data;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await apiClient.get<ApiEnvelope<CurrentUser>>('/auth/me');
  return res.data.data;
}
