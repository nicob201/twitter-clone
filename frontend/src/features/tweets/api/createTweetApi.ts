import { apiClient } from '../../../shared/api/client.js';
import type { CreateTweetInput, CreateTweetResponse } from '../types/tweets.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function createTweet(input: CreateTweetInput): Promise<CreateTweetResponse> {
  const res = await apiClient.post<ApiEnvelope<CreateTweetResponse>>('/tweets', input);
  return res.data.data;
}
