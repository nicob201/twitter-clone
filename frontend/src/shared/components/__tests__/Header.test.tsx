import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../../features/auth/context/AuthContext.js';
import Header from '../Header.js';

function renderHeader(authValue: Record<string, unknown>) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue as any}>
        <Header />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  const baseAuth = {
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
  };

  it('should render the authenticated username', () => {
    renderHeader(baseAuth);

    expect(screen.getByText('alice')).toBeDefined();
  });

  it('should call logout when the logout button is clicked', () => {
    const mockLogout = vi.fn();

    renderHeader({ ...baseAuth, logout: mockLogout });

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
