import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { useProfileFollow } from '../hooks/useProfileFollow.js';
import FollowButton from '../components/FollowButton.js';

function ProfilePage() {
  const { user } = useAuth();
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const profileUserId = paramUserId || user?.id || '';
  const { profile, isLoading, error, refresh } = useUserProfile(profileUserId);
  const {
    follow,
    unfollow,
    isLoading: isFollowLoading,
    error: followError,
  } = useProfileFollow(refresh);
  const isOwnProfile = user?.id === profileUserId;

  if (isLoading) {
    return (
      <div className="p-4">
        <div data-testid="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div data-testid="error-state" className="text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <div>Profile not found.</div>
      </div>
    );
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">{profile.username}</h1>
      <p className="mb-4 text-gray-500">Joined {joinedDate}</p>

      <FollowButton
        isFollowedByCurrentUser={profile.isFollowedByCurrentUser}
        isOwnProfile={isOwnProfile}
        onFollow={() => {
          void follow(profile.id);
        }}
        onUnfollow={() => {
          void unfollow(profile.id);
        }}
        isLoading={isFollowLoading}
        error={followError}
      />

      <div className="flex gap-6">
        <div>
          <p className="text-lg font-semibold">{profile.tweetsCount}</p>
          <p className="text-sm text-gray-500">Tweets</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.followersCount}</p>
          <p className="text-sm text-gray-500">Followers</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{profile.followingCount}</p>
          <p className="text-sm text-gray-500">Following</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
