import type { TimelineTweet } from '../types/timeline.types.js';

interface TweetCardProps {
  tweet: TimelineTweet;
}

function TweetCard({ tweet }: TweetCardProps) {
  return (
    <div className="border-b border-gray-100 p-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold">{tweet.author.username}</span>
        <span className="text-sm text-gray-500">
          {new Date(tweet.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="mt-1 text-gray-900">{tweet.content}</p>
      <div className="mt-2 text-sm text-gray-500">
        {tweet.likesCount} {tweet.likesCount === 1 ? 'like' : 'likes'}
      </div>
    </div>
  );
}

export default TweetCard;
