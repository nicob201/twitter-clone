import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

async function renderLoginPage() {
  const mockLogin = vi.fn<(email: string, password: string) => Promise<void>>();
  const LoginPage = (await import('../pages/LoginPage.js')).default;

  render(
    <AuthContext.Provider
      value={{
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

  return { mockLogin };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login on form submit', async () => {
    const { mockLogin } = await renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('a@b.com', 'password123');
    });
  });

  it('should show error when login fails', async () => {
    const { mockLogin } = await renderLoginPage();

    mockLogin.mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  it('should navigate to / on successful login', async () => {
    const { mockLogin } = await renderLoginPage();

    mockLogin.mockResolvedValue(undefined);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
