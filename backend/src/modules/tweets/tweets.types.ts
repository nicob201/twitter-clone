export interface TweetResponse {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: Date;
}
