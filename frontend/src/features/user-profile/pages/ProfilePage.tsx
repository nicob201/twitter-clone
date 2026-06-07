import { useAuth } from '../../auth/hooks/useAuth.js';
import { useUserProfile } from '../hooks/useUserProfile.js';

function ProfilePage() {
  const { user } = useAuth();
  const { profile, isLoading, error } = useUserProfile(user?.id ?? '');

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
