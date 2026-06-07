import { apiClient } from '../../../shared/api/client.js';
import type { CreateTweetInput, CreateTweetResponse } from '../types/tweets.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function createTweet(input: CreateTweetInput): Promise<CreateTweetResponse> {
  if (input.image) {
    const formData = new FormData();
    formData.append('content', input.content);
    formData.append('image', input.image);
    const res = await apiClient.post<ApiEnvelope<CreateTweetResponse>>('/tweets', formData);
    return res.data.data;
  }

  const res = await apiClient.post<ApiEnvelope<CreateTweetResponse>>('/tweets', {
    content: input.content,
  });
  return res.data.data;
}
