import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../auth/context/AuthContext.js';
import ProfilePage from '../pages/ProfilePage.js';
import { createDeferred } from '../../../shared/test-utils/deferred.js';

const { mockFetchProfile } = vi.hoisted(() => ({
  mockFetchProfile: vi.fn(),
}));

const { mockFollowUser, mockUnfollowUser } = vi.hoisted(() => ({
  mockFollowUser: vi.fn(),
  mockUnfollowUser: vi.fn(),
}));

vi.mock('../api/userProfileApi.js', () => ({
  fetchProfile: mockFetchProfile,
}));

vi.mock('../../follows/api/followsApi.js', () => ({
  followUser: mockFollowUser,
  unfollowUser: mockUnfollowUser,
}));

const ownUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  bio: null,
  avatarUrl: null,
};

const mockAuthValue = {
  user: ownUser,
  token: 'token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderWithRoute(initialEntry: string) {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const mockOwnProfile = {
  id: 'user-1',
  username: 'testuser',
  createdAt: '2025-01-01T00:00:00.000Z',
  tweetsCount: 42,
  followersCount: 100,
  followingCount: 7,
  isFollowedByCurrentUser: false,
};

const mockOtherProfile = {
  id: 'other-user',
  username: 'otheruser',
  createdAt: '2025-01-01T00:00:00.000Z',
  tweetsCount: 10,
  followersCount: 5,
  followingCount: 2,
  isFollowedByCurrentUser: false,
};

const mockOtherProfileFollowed = {
  ...mockOtherProfile,
  isFollowedByCurrentUser: true,
  followersCount: 6,
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', async () => {
    const deferred = createDeferred<unknown>();
    mockFetchProfile.mockReturnValue(deferred.promise);

    renderWithRoute('/profile/other-user');

    expect(screen.getByTestId('loading-state')).toBeDefined();

    deferred.resolve(mockOtherProfile);
    await waitFor(() => {
      expect(screen.getByText('otheruser')).toBeDefined();
    });
  });

  it('should show own profile without follow button', async () => {
    mockFetchProfile.mockResolvedValue(mockOwnProfile);

    renderWithRoute('/profile');

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
    expect(screen.queryByRole('button', { name: 'Follow' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).toBeNull();
  });

  it('should show error state on failure', async () => {
    mockFetchProfile.mockRejectedValue({
      response: { data: { error: 'User not found' } },
    });

    renderWithRoute('/profile');

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeDefined();
    });

    expect(screen.getByText('User not found')).toBeDefined();
  });

  it('should fetch different profile based on route', async () => {
    mockFetchProfile.mockResolvedValue(mockOwnProfile);

    renderWithRoute('/profile');

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledWith('user-1');
    });
  });

  it('should fetch other user profile based on route param', async () => {
    mockFetchProfile.mockResolvedValue(mockOtherProfile);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledWith('other-user');
    });
  });

  it('should show follow button for another user', async () => {
    mockFetchProfile.mockResolvedValue(mockOtherProfile);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByText('otheruser')).toBeDefined();
    });

    expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Unfollow' })).toBeNull();
  });

  it('should show unfollow button when already following', async () => {
    mockFetchProfile.mockResolvedValue(mockOtherProfileFollowed);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
    });

    expect(screen.queryByRole('button', { name: 'Follow' })).toBeNull();
  });

  it('should call follow and refresh profile', async () => {
    mockFollowUser.mockResolvedValue(undefined);
    mockFetchProfile
      .mockResolvedValueOnce(mockOtherProfile)
      .mockResolvedValueOnce(mockOtherProfileFollowed);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByText('otheruser')).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Follow' }));

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith('other-user');
    });

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
    });
  });

  it('should call unfollow and refresh profile', async () => {
    mockUnfollowUser.mockResolvedValue(undefined);
    mockFetchProfile
      .mockResolvedValueOnce(mockOtherProfileFollowed)
      .mockResolvedValueOnce(mockOtherProfile);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Unfollow' }));

    await waitFor(() => {
      expect(mockUnfollowUser).toHaveBeenCalledWith('other-user');
    });

    await waitFor(() => {
      expect(mockFetchProfile).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    });
  });

  it('should not refresh profile when follow fails', async () => {
    mockFollowUser.mockRejectedValue(new Error('API error'));
    mockFetchProfile.mockResolvedValue(mockOtherProfile);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Follow' }));

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith('other-user');
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update follow')).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);
  });

  it('should not refresh profile when unfollow fails', async () => {
    mockUnfollowUser.mockRejectedValue(new Error('API error'));
    mockFetchProfile.mockResolvedValue(mockOtherProfileFollowed);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Unfollow' })).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Unfollow' }));

    await waitFor(() => {
      expect(mockUnfollowUser).toHaveBeenCalledWith('other-user');
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to update follow')).toBeDefined();
    });

    expect(mockFetchProfile).toHaveBeenCalledTimes(1);
  });

  it('should disable follow button while loading', async () => {
    const deferred = createDeferred<unknown>();
    mockFollowUser.mockReturnValue(deferred.promise);
    mockFetchProfile.mockResolvedValue(mockOtherProfile);

    renderWithRoute('/profile/other-user');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Follow' }));

    expect(screen.getByRole('button', { name: 'Following...' })).toBeDefined();

    deferred.resolve(undefined);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Follow' })).toBeDefined();
    });
  });

  it('should transition from loading to idle', async () => {
    const deferred = createDeferred<unknown>();
    mockFetchProfile.mockReturnValue(deferred.promise);

    renderWithRoute('/profile/other-user');

    expect(screen.getByTestId('loading-state')).toBeDefined();

    deferred.resolve(mockOtherProfile);

    await waitFor(() => {
      expect(screen.getByText('otheruser')).toBeDefined();
    });

    expect(screen.queryByTestId('loading-state')).toBeNull();
  });
});
