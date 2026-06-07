import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../../../features/auth/context/AuthContext.js';
import Header from '../Header.js';

describe('Header', () => {
  it('should render the authenticated username', () => {
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
          logout: vi.fn(),
        }}
      >
        <Header />
      </AuthContext.Provider>,
    );

    expect(screen.getByText('alice')).toBeDefined();
  });

  it('should call logout when the logout button is clicked', () => {
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
        <Header />
      </AuthContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
