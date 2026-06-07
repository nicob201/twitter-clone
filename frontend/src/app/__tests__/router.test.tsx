import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../features/auth/context/AuthContext.js';
import type { AuthContextType } from '../../features/auth/context/AuthContext.js';
import ProtectedRoute from '../../shared/components/ProtectedRoute.js';
import Layout from '../../shared/components/Layout.js';
import TimelinePage from '../../features/timeline/pages/TimelinePage.js';
import SearchPage from '../../features/user-search/pages/SearchPage.js';
import ProfilePage from '../../features/user-profile/pages/ProfilePage.js';

vi.mock('../../features/timeline/api/timelineApi.js', () => ({
  fetchTimeline: vi
    .fn()
    .mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0 } }),
}));

const { mockFetchProfile } = vi.hoisted(() => ({
  mockFetchProfile: vi.fn(),
}));

vi.mock('../../features/user-profile/api/userProfileApi.js', () => ({
  fetchProfile: mockFetchProfile,
}));

vi.mock('../../features/follows/api/followsApi.js', () => ({
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
}));

function createMockAuth(overrides: Partial<AuthContextType>): AuthContextType {
  return {
    user: { id: '1', email: 'alice@example.com', username: 'alice', bio: null, avatarUrl: null },
    token: 'token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  };
}

function renderApp(initialEntries: string[], authValue: AuthContextType) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/register" element={<div>Register page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<TimelinePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('router integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should render Timeline route with Layout shell when authenticated', async () => {
    renderApp(['/'], createMockAuth({}));

    expect(screen.getAllByText('alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    expect(await screen.findByText('Timeline')).toBeDefined();
  });

  it('should render Search route with Layout shell when authenticated', () => {
    renderApp(['/search'], createMockAuth({}));

    expect(screen.getAllByText('alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    expect(screen.getByText('Search Users')).toBeDefined();
  });

  it('should render Profile route with Layout shell when authenticated', async () => {
    mockFetchProfile.mockResolvedValue({
      id: '1',
      username: 'alice',
      createdAt: '2025-01-01T00:00:00.000Z',
      tweetsCount: 42,
      followersCount: 100,
      followingCount: 7,
      isFollowedByCurrentUser: false,
    });

    renderApp(['/profile'], createMockAuth({}));

    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText('Followers')).toBeDefined();
    });
  });

  it('should redirect to login when not authenticated', () => {
    renderApp(['/'], createMockAuth({ isAuthenticated: false, user: null, token: null }));

    expect(screen.getByText('Login page')).toBeDefined();
    expect(screen.queryByText('Timeline')).toBeNull();
  });

  it('should render login page at /login', () => {
    renderApp(['/login'], createMockAuth({}));

    expect(screen.getByText('Login page')).toBeDefined();
  });

  it('should render register page at /register', () => {
    renderApp(['/register'], createMockAuth({}));

    expect(screen.getByText('Register page')).toBeDefined();
  });
});
