export interface CreateTweetInput {
  content: string;
}

export interface CreateTweetResponse {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}
