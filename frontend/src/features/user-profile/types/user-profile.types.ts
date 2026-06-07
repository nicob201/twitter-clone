export interface UserProfile {
  id: string;
  username: string;
  createdAt: string;
  tweetsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
  bio: string | null;
  avatarUrl: string | null;
}
