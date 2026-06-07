import { apiClient } from '../../../shared/api/client.js';
import type { TimelineResponse } from '../types/timeline.types.js';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export async function fetchTimeline(page: number, limit: number): Promise<TimelineResponse> {
  const res = await apiClient.get<ApiEnvelope<TimelineResponse>>('/timeline', {
    params: { page, limit },
  });
  return res.data.data;
}
