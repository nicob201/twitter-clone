import type { TimelineTweet } from '../types/timeline.types.js';
import { API_URL } from '../../../shared/api/client.js';

interface TweetCardProps {
  tweet: TimelineTweet;
  disabled?: boolean;
  onToggleLike?: (tweetId: string, liked: boolean) => void;
}

function TweetCard({ tweet, disabled, onToggleLike }: TweetCardProps) {
  const { likedByCurrentUser, likesCount } = tweet;

  return (
    <div className="border-b border-gray-100 p-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{tweet.author.username}</span>
        <span className="text-sm text-gray-500">
          {new Date(tweet.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="mt-1 text-gray-900">{tweet.content}</p>
      {tweet.imageUrl && (
        <img
          src={`${API_URL}${tweet.imageUrl}`}
          alt="Tweet image"
          className="mt-2 max-h-64 w-full rounded object-contain border border-gray-100"
        />
      )}
      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onToggleLike?.(tweet.id, likedByCurrentUser);
          }}
          className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
            likedByCurrentUser ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:bg-gray-100'
          } disabled:opacity-50`}
        >
          {likedByCurrentUser ? '\u2764\uFE0F' : '\u2661'}
          <span>{likesCount}</span>
        </button>
      </div>
    </div>
  );
}

export default TweetCard;
