interface FollowButtonProps {
  isFollowedByCurrentUser: boolean;
  isOwnProfile: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  isLoading: boolean;
  error: string | null;
}

function FollowButton({
  isFollowedByCurrentUser,
  isOwnProfile,
  onFollow,
  onUnfollow,
  isLoading,
  error,
}: FollowButtonProps) {
  if (isOwnProfile) {
    return null;
  }

  const buttonLabel = isLoading
    ? isFollowedByCurrentUser
      ? 'Unfollowing...'
      : 'Following...'
    : isFollowedByCurrentUser
      ? 'Unfollow'
      : 'Follow';

  const buttonAction = isFollowedByCurrentUser ? onUnfollow : onFollow;

  return (
    <div className="mb-4">
      <button
        onClick={buttonAction}
        disabled={isLoading}
        className={
          isFollowedByCurrentUser
            ? 'rounded border border-red-500 px-4 py-1 text-red-500 hover:bg-red-50 disabled:opacity-50'
            : 'rounded bg-blue-500 px-4 py-1 text-white hover:bg-blue-600 disabled:opacity-50'
        }
      >
        {buttonLabel}
      </button>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FollowButton;
