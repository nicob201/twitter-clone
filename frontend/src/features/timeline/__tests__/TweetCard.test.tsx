import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TweetCard from '../components/TweetCard.js';
import type { TimelineTweet } from '../types/timeline.types.js';

const mockTweet: TimelineTweet = {
  id: '1',
  content: 'Hello world',
  createdAt: '2025-06-01T12:00:00.000Z',
  author: { id: 'user-1', username: 'alice' },
  likesCount: 5,
  likedByCurrentUser: false,
  imageUrl: null,
};

describe('TweetCard', () => {
  it('should render the author username', () => {
    render(<TweetCard tweet={mockTweet} />);

    expect(screen.getByText('alice')).toBeDefined();
  });

  it('should render the tweet content', () => {
    render(<TweetCard tweet={mockTweet} />);

    expect(screen.getByText('Hello world')).toBeDefined();
  });

  it('should render the likes count', () => {
    render(<TweetCard tweet={mockTweet} />);

    expect(screen.getByText('5')).toBeDefined();
  });

  it('should render the created date', () => {
    render(<TweetCard tweet={mockTweet} />);

    const dateString = new Date(mockTweet.createdAt).toLocaleDateString();
    expect(screen.getByText(dateString)).toBeDefined();
  });

  it('should call onToggleLike with tweet id and liked state', () => {
    const onToggleLike = vi.fn();

    render(<TweetCard tweet={mockTweet} onToggleLike={onToggleLike} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onToggleLike).toHaveBeenCalledWith('1', false);
  });

  it('should call onToggleLike with liked=true when tweet is liked', () => {
    const onToggleLike = vi.fn();
    const likedTweet: TimelineTweet = { ...mockTweet, likedByCurrentUser: true };

    render(<TweetCard tweet={likedTweet} onToggleLike={onToggleLike} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onToggleLike).toHaveBeenCalledWith('1', true);
  });

  it('should not call onToggleLike when disabled', () => {
    const onToggleLike = vi.fn();

    render(<TweetCard tweet={mockTweet} onToggleLike={onToggleLike} disabled />);

    fireEvent.click(screen.getByRole('button'));

    expect(onToggleLike).not.toHaveBeenCalled();
  });

  it('should show filled heart when liked', () => {
    render(<TweetCard tweet={{ ...mockTweet, likedByCurrentUser: true }} />);

    const button = screen.getByRole('button');
    expect(button.innerHTML).toContain('\u2764');
  });

  it('should show empty heart when not liked', () => {
    render(<TweetCard tweet={mockTweet} />);

    const button = screen.getByRole('button');
    expect(button.innerHTML).toContain('\u2661');
  });

  describe('image rendering', () => {
    it('should render an image when imageUrl is provided', () => {
      const tweetWithImage: TimelineTweet = {
        ...mockTweet,
        imageUrl: '/uploads/test.png',
      };

      render(<TweetCard tweet={tweetWithImage} />);

      const img = screen.getByAltText('Tweet image');
      expect(img).toBeDefined();
      expect(img.getAttribute('src')).toBe('http://localhost:3000/uploads/test.png');
    });

    it('should not render an image when imageUrl is null', () => {
      render(<TweetCard tweet={mockTweet} />);

      expect(screen.queryByAltText('Tweet image')).toBeNull();
    });
  });
});
