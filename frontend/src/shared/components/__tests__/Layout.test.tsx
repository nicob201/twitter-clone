import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../../features/auth/context/AuthContext.js';
import Layout from '../Layout.js';

const mockAuthValue = {
  user: { id: '1', email: 'alice@example.com', username: 'alice', bio: null, avatarUrl: null },
  token: 'token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderLayout(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthContext.Provider value={mockAuthValue}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div data-testid="outlet-content">Home page content</div>} />
            <Route path="/search" element={<div>Search page content</div>} />
            <Route path="/profile" element={<div>Profile page content</div>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  it('should render Header with authenticated username', () => {
    renderLayout();

    expect(screen.getByText('alice')).toBeDefined();
  });

  it('should render Header with logout action', () => {
    renderLayout();

    expect(screen.getByRole('button', { name: 'Log out' })).toBeDefined();
  });

  it('should render navigation links in Sidebar and MobileNav', () => {
    renderLayout();

    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Search').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profile').length).toBeGreaterThanOrEqual(1);
  });

  it('should render Outlet content for the current route', () => {
    renderLayout('/');

    expect(screen.getByTestId('outlet-content')).toBeDefined();
    expect(screen.getByText('Home page content')).toBeDefined();
  });

  it('should render different Outlet content for different routes', () => {
    renderLayout('/search');

    expect(screen.getByText('Search page content')).toBeDefined();
  });
});
