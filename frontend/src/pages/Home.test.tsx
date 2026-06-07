import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../features/auth/context/AuthContext.js';
import Home from './Home';

function renderHome() {
  const mockLogout = vi.fn();

  render(
    <AuthContext.Provider
      value={{
        user: {
          id: '1',
          email: 'alice@example.com',
          username: 'alice',
          bio: null,
          avatarUrl: null,
        },
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: mockLogout,
      }}
    >
      <Home />
    </AuthContext.Provider>,
  );

  return { mockLogout };
}

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render the authenticated username', () => {
    renderHome();
    expect(screen.getByText('Welcome, alice')).toBeDefined();
  });

  it('should render the authenticated email', () => {
    renderHome();
    expect(screen.getByText('alice@example.com')).toBeDefined();
  });

  it('should call logout when logout button is clicked', () => {
    const { mockLogout } = renderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
