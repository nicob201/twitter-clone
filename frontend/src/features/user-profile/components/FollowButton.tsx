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
    <div className="flex flex-col items-end">
      <button
        onClick={buttonAction}
        disabled={isLoading}
        className={
          isFollowedByCurrentUser
            ? 'rounded-full border border-red-500 px-5 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50'
            : 'rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
        }
      >
        {buttonLabel}
      </button>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default FollowButton;
