import type { TimelineTweet } from '../types/timeline.types.js';
import TweetCard from './TweetCard.js';

interface TimelineListProps {
  tweets: TimelineTweet[];
  currentUserId?: string;
  loadingTweetId?: string | null;
  deletingTweetId?: string | null;
  onToggleLike?: (tweetId: string, liked: boolean) => void;
  onDelete?: (tweetId: string) => void;
}

function TimelineList({
  tweets,
  currentUserId,
  loadingTweetId,
  deletingTweetId,
  onToggleLike,
  onDelete,
}: TimelineListProps) {
  if (tweets.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No tweets yet. Follow users to see their tweets here.
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          currentUserId={currentUserId}
          disabled={loadingTweetId === tweet.id || deletingTweetId === tweet.id}
          onToggleLike={onToggleLike}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TimelineList;
