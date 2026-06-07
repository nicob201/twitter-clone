export interface TimelineTweet {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface TimelinePagination {
  page: number;
  limit: number;
  total: number;
}

export interface TimelineResponse {
  data: TimelineTweet[];
  pagination: TimelinePagination;
}
