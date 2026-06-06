export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}
