import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AuthContext } from '../../auth/context/AuthContext.js';
import TimelinePage from '../pages/TimelinePage.js';
import type { TimelineTweet } from '../types/timeline.types.js';

const { mockFetchTimeline } = vi.hoisted(() => ({
  mockFetchTimeline: vi.fn(),
}));

vi.mock('../api/timelineApi.js', () => ({
  fetchTimeline: mockFetchTimeline,
}));

const { mockCreateTweet } = vi.hoisted(() => ({
  mockCreateTweet: vi.fn(),
}));

vi.mock('../../tweets/api/createTweetApi.js', () => ({
  createTweet: mockCreateTweet,
}));

const mockTweets: TimelineTweet[] = [
  {
    id: '1',
    content: 'First tweet',
    createdAt: '2025-06-01T12:00:00.000Z',
    author: { id: 'user-1', username: 'alice' },
    likesCount: 3,
  },
  {
    id: '2',
    content: 'Second tweet',
    createdAt: '2025-06-02T12:00:00.000Z',
    author: { id: 'user-2', username: 'bob' },
    likesCount: 7,
  },
];

const mockAuthValue = {
  user: { id: '1', email: 'a@a.com', username: 'alice', bio: null, avatarUrl: null },
  token: 'token',
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

function renderPage() {
  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <TimelinePage />
    </AuthContext.Provider>,
  );
}

describe('TimelinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    mockFetchTimeline.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByTestId('loading-state')).toBeDefined();
    expect(screen.getByText('Loading timeline...')).toBeDefined();
  });

  it('should render tweets on success', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    expect(screen.getByText('Second tweet')).toBeDefined();
    expect(screen.getByText('alice')).toBeDefined();
    expect(screen.getByText('bob')).toBeDefined();
    expect(screen.getByText('3 likes')).toBeDefined();
    expect(screen.getByText('7 likes')).toBeDefined();
  });

  it('should show empty state when there are no tweets', async () => {
    mockFetchTimeline.mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0 } });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText('No tweets yet. Follow users to see their tweets here.'),
      ).toBeDefined();
    });
  });

  it('should show error state on failure', async () => {
    mockFetchTimeline.mockRejectedValue({
      response: { data: { error: 'Failed to load timeline' } },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeDefined();
    });

    expect(screen.getByText('Failed to load timeline')).toBeDefined();
  });

  it('should keep existing tweets visible during refresh', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    const updatedTweets: TimelineTweet[] = [
      ...mockTweets,
      {
        id: '3',
        content: 'New tweet',
        createdAt: '2025-06-03T12:00:00.000Z',
        author: { id: 'user-1', username: 'alice' },
        likesCount: 1,
      },
    ];

    mockFetchTimeline.mockResolvedValue({
      data: updatedTweets,
      pagination: { page: 1, limit: 20, total: 3 },
    });

    mockCreateTweet.mockResolvedValue({
      id: '3',
      content: 'New tweet',
      authorId: 'user-1',
      createdAt: '2025-06-03T12:00:00.000Z',
    });

    const textarea = screen.getByPlaceholderText('What is happening?');
    fireEvent.change(textarea, { target: { value: 'New tweet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(screen.getByText('New tweet')).toBeDefined();
    });

    expect(screen.queryByTestId('loading-state')).toBeNull();
  });
});
