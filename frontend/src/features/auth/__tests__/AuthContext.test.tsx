import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context/AuthContext.js';
import { useContext } from 'react';
import type { CurrentUser } from '../types/auth.types.js';

const { mockLoginUser, mockRegisterUser, mockFetchCurrentUser } = vi.hoisted(() => ({
  mockLoginUser: vi.fn(),
  mockRegisterUser: vi.fn(),
  mockFetchCurrentUser: vi.fn(),
}));

vi.mock('../api/authApi.js', () => ({
  loginUser: mockLoginUser,
  registerUser: mockRegisterUser,
  fetchCurrentUser: mockFetchCurrentUser,
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

function TestConsumer() {
  const context = useContext(AuthContext);

  if (!context) return <div>No context</div>;

  return (
    <div>
      <div data-testid="user">{context.user?.username ?? 'null'}</div>
      <div data-testid="authenticated">{String(context.isAuthenticated)}</div>
      <div data-testid="loading">{String(context.isLoading)}</div>
      <div data-testid="token">{context.token ?? 'null'}</div>
      <button
        onClick={() => {
          context.login('a@b.com', 'password').catch(() => {});
        }}
        data-testid="login-btn"
      >
        Login
      </button>
      <button
        onClick={() => {
          context.register('a@b.com', 'user', 'password').catch(() => {});
        }}
        data-testid="register-btn"
      >
        Register
      </button>
      <button onClick={context.logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('should start with no user and not loading', async () => {
    mockFetchCurrentUser.mockRejectedValue(new Error('no token'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('should hydrate user when token exists in localStorage', async () => {
    localStorage.setItem('token', 'valid-token');

    const mockUser: CurrentUser = {
      id: '1',
      email: 'a@b.com',
      username: 'testuser',
      bio: null,
      avatarUrl: null,
    };
    mockFetchCurrentUser.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
  });

  it('should clear invalid token from localStorage on hydrate failure', async () => {
    localStorage.setItem('token', 'invalid-token');
    mockFetchCurrentUser.mockRejectedValue(new Error('unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should login and set user', async () => {
    mockFetchCurrentUser.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      username: 'testuser',
      bio: null,
      avatarUrl: null,
    });
    mockLoginUser.mockResolvedValue({
      user: { id: '1', email: 'a@b.com', username: 'testuser' },
      token: 'new-token',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByTestId('login-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('new-token');
    });
  });

  it('should logout and clear user', async () => {
    localStorage.setItem('token', 'valid-token');
    mockFetchCurrentUser.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      username: 'testuser',
      bio: null,
      avatarUrl: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('testuser');
    });

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should register and set user', async () => {
    mockFetchCurrentUser.mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      username: 'newuser',
      bio: null,
      avatarUrl: null,
    });
    mockRegisterUser.mockResolvedValue({
      user: { id: '1', email: 'a@b.com', username: 'newuser' },
      token: 'register-token',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    fireEvent.click(screen.getByTestId('register-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('newuser');
    });

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('register-token');
    });
  });
});
