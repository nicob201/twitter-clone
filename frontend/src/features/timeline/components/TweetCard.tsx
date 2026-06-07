import type { TimelineTweet } from '../types/timeline.types.js';
import { API_URL } from '../../../shared/api/client.js';

interface TweetCardProps {
  tweet: TimelineTweet;
  currentUserId?: string;
  disabled?: boolean;
  onToggleLike?: (tweetId: string, liked: boolean) => void;
  onDelete?: (tweetId: string) => void;
}

function TweetCard({ tweet, currentUserId, disabled, onToggleLike, onDelete }: TweetCardProps) {
  const { likedByCurrentUser, likesCount } = tweet;
  const isOwnTweet = currentUserId !== undefined && tweet.author.id === currentUserId;

  return (
    <div className="border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50/50">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
          {tweet.author.username[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-bold text-gray-900">{tweet.author.username}</span>
            <span className="hidden truncate text-sm text-gray-500 sm:inline">
              @{tweet.author.username}
            </span>
            <span className="text-sm text-gray-400">·</span>
            <span className="whitespace-nowrap text-sm text-gray-400">
              {new Date(tweet.createdAt).toLocaleDateString()}
            </span>
            {isOwnTweet && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(tweet.id);
                }}
                disabled={disabled}
                className="ml-auto text-sm text-gray-400 hover:text-red-500 disabled:opacity-50"
                data-testid="delete-tweet-button"
              >
                Delete
              </button>
            )}
          </div>
          <p className="mt-1 text-[15px] leading-normal text-gray-900">{tweet.content}</p>
          {tweet.imageUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100">
              <img
                src={`${API_URL}${tweet.imageUrl}`}
                alt="Tweet image"
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onToggleLike?.(tweet.id, likedByCurrentUser);
              }}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors ${
                likedByCurrentUser
                  ? 'text-pink-600 hover:bg-pink-50'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-500'
              } disabled:opacity-50`}
            >
              {likedByCurrentUser ? '\u2764\uFE0F' : '\u2661'}
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TweetCard;
