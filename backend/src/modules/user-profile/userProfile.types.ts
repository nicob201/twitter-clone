export interface UserProfileResponse {
  id: string;
  username: string;
  createdAt: Date;
  tweetsCount: number;
  followersCount: number;
  followingCount: number;
}
