import { apiClient } from '../../../shared/api/client.js';
import type { SearchUser } from '../types/user-search.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface SearchData {
  data: SearchUser[];
}

export async function searchUsers(query: string): Promise<SearchUser[]> {
  const res = await apiClient.get<ApiEnvelope<SearchData>>('/users/search', {
    params: { q: query },
  });
  return res.data.data.data;
}
