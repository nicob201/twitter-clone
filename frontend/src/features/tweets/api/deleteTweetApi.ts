import { apiClient } from '../../../shared/api/client.js';

export async function deleteTweet(tweetId: string): Promise<void> {
  await apiClient.delete(`/tweets/${tweetId}`);
}
