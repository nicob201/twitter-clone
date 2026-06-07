import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext.js';
import ProfilePage from '../pages/ProfilePage.js';

const { mockFetchProfile } = vi.hoisted(() => ({
  mockFetchProfile: vi.fn(),
}));

vi.mock('../api/userProfileApi.js', () => ({
  fetchProfile: mockFetchProfile,
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  bio: null,
  avatarUrl: null,
};

const mockAuthValue = {
  user: mockUser,
  token: 'token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderPage() {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockFetchProfile.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByTestId('loading-state')).toBeDefined();
  });

  it('should show profile on success', async () => {
    mockFetchProfile.mockResolvedValue({
      id: 'user-1',
      username: 'testuser',
      createdAt: '2025-01-01T00:00:00.000Z',
      tweetsCount: 42,
      followersCount: 100,
      followingCount: 7,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeDefined();
    });

    expect(screen.getByText('Joined January 2025')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('100')).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('Tweets')).toBeDefined();
    expect(screen.getByText('Followers')).toBeDefined();
    expect(screen.getByText('Following')).toBeDefined();
  });

  it('should show error state on failure', async () => {
    mockFetchProfile.mockRejectedValue({
      response: { data: { error: 'User not found' } },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeDefined();
    });

    expect(screen.getByText('User not found')).toBeDefined();
  });
});
