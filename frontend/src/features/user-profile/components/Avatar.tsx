interface AvatarProps {
  avatarUrl: string | null;
  username: string;
  size?: 'md' | 'lg';
}

function Avatar({ avatarUrl, username, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        className={`${sizeClass} rounded-full object-cover`}
        data-testid="avatar-image"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold`}
      data-testid="avatar-placeholder"
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

export default Avatar;
