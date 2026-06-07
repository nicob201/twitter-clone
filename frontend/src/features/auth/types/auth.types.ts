export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
}
