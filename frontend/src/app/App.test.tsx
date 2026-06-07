import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('../features/auth/api/authApi.js', () => ({
  fetchCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
});

describe('App routing', () => {
  it('should redirect unauthenticated user to login', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Log in' })).toBeDefined();
    });
  });
});
