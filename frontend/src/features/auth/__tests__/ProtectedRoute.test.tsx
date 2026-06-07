import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.js';
import type { ComponentType } from 'react';

let ProtectedRoute: ComponentType;

beforeAll(async () => {
  const mod = await import('../../../shared/components/ProtectedRoute.js');
  ProtectedRoute = mod.default;
});

function renderProtectedRoute(authValue: { isAuthenticated: boolean; isLoading: boolean }) {
  return render(
    <AuthContext.Provider
      value={{
        user: null,
        token: null,
        ...authValue,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected content</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    renderProtectedRoute({ isAuthenticated: true, isLoading: false });

    expect(screen.getByText('Protected content')).toBeDefined();
  });

  it('should redirect to /login when not authenticated', () => {
    renderProtectedRoute({ isAuthenticated: false, isLoading: false });

    expect(screen.getByText('Login page')).toBeDefined();
    expect(screen.queryByText('Protected content')).toBeNull();
  });

  it('should show loading state while auth is loading', () => {
    renderProtectedRoute({ isAuthenticated: false, isLoading: true });

    expect(screen.getByText('Loading...')).toBeDefined();
    expect(screen.queryByText('Protected content')).toBeNull();
    expect(screen.queryByText('Login page')).toBeNull();
  });
});
