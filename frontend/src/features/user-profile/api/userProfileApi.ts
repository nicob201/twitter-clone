import { apiClient } from '../../../shared/api/client.js';
import type { UserProfile } from '../types/user-profile.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const res = await apiClient.get<ApiEnvelope<UserProfile>>(`/users/${userId}`);
  return res.data.data;
}
