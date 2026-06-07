import { apiClient } from '../../../shared/api/client.js';

export async function likeTweet(tweetId: string): Promise<void> {
  await apiClient.post(`/tweets/${tweetId}/like`);
}

export async function unlikeTweet(tweetId: string): Promise<void> {
  await apiClient.delete(`/tweets/${tweetId}/like`);
}
