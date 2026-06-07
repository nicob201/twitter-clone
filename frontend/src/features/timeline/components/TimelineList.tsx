import type { TimelineTweet } from '../types/timeline.types.js';
import TweetCard from './TweetCard.js';

interface TimelineListProps {
  tweets: TimelineTweet[];
  loadingTweetId?: string | null;
  onToggleLike?: (tweetId: string, liked: boolean) => void;
}

function TimelineList({ tweets, loadingTweetId, onToggleLike }: TimelineListProps) {
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
          disabled={loadingTweetId === tweet.id}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}

export default TimelineList;
