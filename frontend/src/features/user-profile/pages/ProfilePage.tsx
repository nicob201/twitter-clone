import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { useProfileFollow } from '../hooks/useProfileFollow.js';
import FollowButton from '../components/FollowButton.js';
import Avatar from '../components/Avatar.js';

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
      <div className="border-b border-gray-100 px-4 py-3">
        <div data-testid="loading-state">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-b border-gray-100 px-4 py-3">
        <div data-testid="error-state" className="text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="border-b border-gray-100 px-4 py-3">
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
    <div>
      <div className="border-b border-gray-100 px-4 pt-3 pb-4">
        <div className="flex items-start justify-between">
          <Avatar avatarUrl={profile.avatarUrl} username={profile.username} size="xl" />
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
        </div>
        <div className="mt-4">
          <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
        {profile.bio && (
          <p className="mt-3 text-[15px] leading-normal text-gray-900">{profile.bio}</p>
        )}
        <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
          <span>Joined {joinedDate}</span>
        </div>
        <div className="mt-4 flex gap-5">
          <div>
            <span className="font-bold text-gray-900">{profile.tweetsCount}</span>
            <span className="ml-1 text-sm text-gray-500">Tweets</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{profile.followingCount}</span>
            <span className="ml-1 text-sm text-gray-500">Following</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{profile.followersCount}</span>
            <span className="ml-1 text-sm text-gray-500">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
