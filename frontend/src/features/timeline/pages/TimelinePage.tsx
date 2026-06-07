import { useAuth } from '../../auth/hooks/useAuth.js';
import { useTimeline } from '../hooks/useTimeline.js';
import TimelineList from '../components/TimelineList.js';
import CreateTweetForm from '../../tweets/components/CreateTweetForm.js';
import { useLikeTweet } from '../../likes/hooks/useLikeTweet.js';
import { useDeleteTweet } from '../../tweets/hooks/useDeleteTweet.js';

function TimelinePage() {
  const { user } = useAuth();
  const { tweets, isLoading, error, refresh, removeTweet } = useTimeline(1, 20);
  const { like, unlike, loadingTweetId, error: likeError } = useLikeTweet();
  const { deleteTweet, deletingTweetId, error: deleteError } = useDeleteTweet();

  async function handleToggleLike(tweetId: string, liked: boolean) {
    const success = liked ? await unlike(tweetId) : await like(tweetId);
    if (success) {
      refresh();
    }
  }

  function requestDelete(tweetId: string) {
    if (window.confirm('Delete this tweet? This action cannot be undone.')) {
      void deleteTweet(tweetId).then((success) => {
        if (success) {
          removeTweet(tweetId);
        }
      });
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500" data-testid="loading-state">
        Loading timeline...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500" data-testid="error-state">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="border-b border-gray-200 p-4 text-xl font-bold">Timeline</h1>
      <CreateTweetForm
        onSuccess={() => {
          refresh();
        }}
      />
      {likeError && (
        <div className="p-2 text-center text-sm text-red-500" data-testid="like-error">
          {likeError}
        </div>
      )}
      {deleteError && (
        <div className="p-2 text-center text-sm text-red-500" data-testid="delete-error">
          {deleteError}
        </div>
      )}
      <TimelineList
        tweets={tweets}
        currentUserId={user?.id}
        loadingTweetId={loadingTweetId}
        deletingTweetId={deletingTweetId}
        onToggleLike={(tweetId, liked) => {
          void handleToggleLike(tweetId, liked);
        }}
        onDelete={(tweetId) => {
          requestDelete(tweetId);
        }}
      />
    </div>
  );
}

export default TimelinePage;
