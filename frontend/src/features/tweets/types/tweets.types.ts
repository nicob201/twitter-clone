export interface CreateTweetInput {
  content: string;
  image?: File;
}

export interface CreateTweetResponse {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: string;
}
