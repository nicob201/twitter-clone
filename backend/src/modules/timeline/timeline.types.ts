export interface TimelineTweet {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
  };
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface TimelineData {
  data: TimelineTweet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
