import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../features/auth/context/AuthContext.js';
import type { AuthContextType } from '../../features/auth/context/AuthContext.js';
import ProtectedRoute from '../../shared/components/ProtectedRoute.js';
import Layout from '../../shared/components/Layout.js';
import TimelinePage from '../../features/timeline/pages/TimelinePage.js';
import PlaceholderPage from '../../shared/components/PlaceholderPage.js';

vi.mock('../../features/timeline/api/timelineApi.js', () => ({
  fetchTimeline: vi
    .fn()
    .mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0 } }),
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
              <Route path="/search" element={<PlaceholderPage title="Search" />} />
              <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('router integration', () => {
  it('should render Timeline route with Layout shell when authenticated', async () => {
    renderApp(['/'], createMockAuth({}));

    expect(screen.getByText('alice')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    expect(await screen.findByText('Timeline')).toBeDefined();
  });

  it('should render Search route with Layout shell when authenticated', () => {
    renderApp(['/search'], createMockAuth({}));

    expect(screen.getByText('alice')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Search' })).toBeDefined();
  });

  it('should render Profile route with Layout shell when authenticated', () => {
    renderApp(['/profile'], createMockAuth({}));

    expect(screen.getByText('alice')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined();
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
