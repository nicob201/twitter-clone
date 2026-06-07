import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SearchPage from '../pages/SearchPage.js';

const { mockSearchUsers } = vi.hoisted(() => ({
  mockSearchUsers: vi.fn(),
}));

vi.mock('../api/userSearchApi.js', () => ({
  searchUsers: mockSearchUsers,
}));

function renderPage() {
  return render(<SearchPage />);
}

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search form', () => {
    renderPage();

    expect(screen.getByPlaceholderText('Search users...')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDefined();
  });

  it('should validate short query on submit', async () => {
    renderPage();

    const input = screen.getByPlaceholderText('Search users...');
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Query must be between 2 and 50 characters.')).toBeDefined();
    });

    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it('should show loading state during search', () => {
    mockSearchUsers.mockReturnValue(new Promise(() => {}));

    renderPage();

    const input = screen.getByPlaceholderText('Search users...');
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'alice' } });
    fireEvent.click(button);

    expect(screen.getByTestId('loading-state')).toBeDefined();
  });

  it('should show results after successful search', async () => {
    mockSearchUsers.mockResolvedValue([
      { id: '1', username: 'alice' },
      { id: '2', username: 'bob' },
    ]);

    renderPage();

    const input = screen.getByPlaceholderText('Search users...');
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'ali' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeDefined();
    });

    expect(screen.getByText('bob')).toBeDefined();
    expect(screen.getByText('ID: 1')).toBeDefined();
    expect(screen.getByText('ID: 2')).toBeDefined();
  });

  it('should show empty state when no users found', async () => {
    mockSearchUsers.mockResolvedValue([]);

    renderPage();

    const input = screen.getByPlaceholderText('Search users...');
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'xyz' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('No users found matching your query.')).toBeDefined();
    });
  });

  it('should show error state on API failure', async () => {
    mockSearchUsers.mockRejectedValue({
      response: { data: { error: 'Search failed' } },
    });

    renderPage();

    const input = screen.getByPlaceholderText('Search users...');
    const button = screen.getByRole('button', { name: 'Search' });

    fireEvent.change(input, { target: { value: 'alice' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeDefined();
    });
  });
});
