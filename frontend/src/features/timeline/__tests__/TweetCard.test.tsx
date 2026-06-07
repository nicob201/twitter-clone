import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TweetCard from '../components/TweetCard.js';
import type { TimelineTweet } from '../types/timeline.types.js';

const mockTweet: TimelineTweet = {
  id: '1',
  content: 'Hello world',
  createdAt: '2025-06-01T12:00:00.000Z',
  author: { id: 'user-1', username: 'alice' },
  likesCount: 5,
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

    expect(screen.getByText('5 likes')).toBeDefined();
  });

  it('should render "1 like" for a single like', () => {
    const singleLikeTweet: TimelineTweet = { ...mockTweet, likesCount: 1 };

    render(<TweetCard tweet={singleLikeTweet} />);

    expect(screen.getByText('1 like')).toBeDefined();
  });

  it('should render the created date', () => {
    render(<TweetCard tweet={mockTweet} />);

    const dateString = new Date(mockTweet.createdAt).toLocaleDateString();
    expect(screen.getByText(dateString)).toBeDefined();
  });
});
