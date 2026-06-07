import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

const { mockLikeTweet, mockUnlikeTweet } = vi.hoisted(() => ({
  mockLikeTweet: vi.fn(),
  mockUnlikeTweet: vi.fn(),
}));

const { mockDeleteTweet } = vi.hoisted(() => ({
  mockDeleteTweet: vi.fn(),
}));

vi.mock('../../likes/api/likesApi.js', () => ({
  likeTweet: mockLikeTweet,
  unlikeTweet: mockUnlikeTweet,
}));

vi.mock('../../tweets/api/deleteTweetApi.js', () => ({
  deleteTweet: mockDeleteTweet,
}));

const mockTweets: TimelineTweet[] = [
  {
    id: '1',
    content: 'First tweet',
    createdAt: '2025-06-01T12:00:00.000Z',
    author: { id: 'user-1', username: 'alice' },
    likesCount: 3,
    likedByCurrentUser: false,
    imageUrl: null,
  },
  {
    id: '2',
    content: 'Second tweet',
    createdAt: '2025-06-02T12:00:00.000Z',
    author: { id: 'user-2', username: 'bob' },
    likesCount: 7,
    likedByCurrentUser: true,
    imageUrl: null,
  },
];

const mockAuthValue = {
  user: { id: 'user-1', email: 'a@a.com', username: 'alice', bio: null, avatarUrl: null },
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
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
  });

  it('should render likedByCurrentUser state', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });

    renderPage();

    const likedButton = await screen.findByText('7');
    const likedButtonParent = likedButton.closest('button') as HTMLButtonElement;
    expect(likedButtonParent.innerHTML).toContain('\u2764');

    const unlikedButton = screen.getByText('3');
    const unlikedButtonParent = unlikedButton.closest('button') as HTMLButtonElement;
    expect(unlikedButtonParent.innerHTML).toContain('\u2661');
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

  it('should refresh timeline after successful like', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockLikeTweet.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    mockFetchTimeline.mockClear();

    const likeButton = screen.getByText('3').closest('button') as HTMLButtonElement;
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockFetchTimeline).toHaveBeenCalled();
    });

    expect(mockLikeTweet).toHaveBeenCalledWith('1');
  });

  it('should refresh timeline after successful unlike', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockUnlikeTweet.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Second tweet')).toBeDefined();
    });

    mockFetchTimeline.mockClear();

    const unlikeButton = screen.getByText('7').closest('button') as HTMLButtonElement;
    fireEvent.click(unlikeButton);

    await waitFor(() => {
      expect(mockFetchTimeline).toHaveBeenCalled();
    });

    expect(mockUnlikeTweet).toHaveBeenCalledWith('2');
  });

  it('should not refresh timeline when like fails', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockLikeTweet.mockRejectedValue(new Error('API error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    mockFetchTimeline.mockClear();

    const likeButton = screen.getByText('3').closest('button') as HTMLButtonElement;
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(mockLikeTweet).toHaveBeenCalled();
    });

    expect(mockFetchTimeline).not.toHaveBeenCalled();
  });

  it('should not refresh timeline when unlike fails', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockUnlikeTweet.mockRejectedValue(new Error('API error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Second tweet')).toBeDefined();
    });

    mockFetchTimeline.mockClear();

    const unlikeButton = screen.getByText('7').closest('button') as HTMLButtonElement;
    fireEvent.click(unlikeButton);

    await waitFor(() => {
      expect(mockUnlikeTweet).toHaveBeenCalled();
    });

    expect(mockFetchTimeline).not.toHaveBeenCalled();
  });

  it('should display like error when like fails', async () => {
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockLikeTweet.mockRejectedValue(new Error('API error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    const likeButton = screen.getByText('3').closest('button') as HTMLButtonElement;
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByTestId('like-error')).toBeDefined();
    });

    expect(screen.getByText('Failed to update like')).toBeDefined();
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
        likedByCurrentUser: false,
        imageUrl: null,
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

  it('should remove tweet from UI after successful delete', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockDeleteTweet.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    expect(screen.getByText('Second tweet')).toBeDefined();

    fireEvent.click(screen.getByTestId('delete-tweet-button'));

    await waitFor(() => {
      expect(screen.queryByText('First tweet')).toBeNull();
    });

    expect(screen.getByText('Second tweet')).toBeDefined();
  });

  it('should show delete error when deletion fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockDeleteTweet.mockRejectedValue(new Error('API error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('delete-tweet-button'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeDefined();
    });
  });

  it('should not call delete API when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockDeleteTweet.mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('delete-tweet-button'));

    expect(mockDeleteTweet).not.toHaveBeenCalled();
    expect(screen.getByText('First tweet')).toBeDefined();
  });

  it('should prevent duplicate delete requests', async () => {
    let resolveDeferred: (v?: undefined) => void = () => {};
    const deferred = new Promise<undefined>((resolve) => {
      resolveDeferred = resolve;
    });

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockFetchTimeline.mockResolvedValue({
      data: mockTweets,
      pagination: { page: 1, limit: 20, total: 2 },
    });
    mockDeleteTweet.mockReturnValue(deferred);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('First tweet')).toBeDefined();
    });

    fireEvent.click(screen.getByTestId('delete-tweet-button'));
    fireEvent.click(screen.getByTestId('delete-tweet-button'));
    fireEvent.click(screen.getByTestId('delete-tweet-button'));

    await waitFor(() => {
      expect(mockDeleteTweet).toHaveBeenCalledTimes(1);
    });

    resolveDeferred();
  });
});
