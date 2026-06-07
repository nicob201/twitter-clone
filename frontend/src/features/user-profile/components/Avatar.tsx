interface AvatarProps {
  avatarUrl: string | null;
  username: string;
  size?: 'md' | 'lg' | 'xl';
}

function Avatar({ avatarUrl, username, size = 'md' }: AvatarProps) {
  const sizeClass =
    size === 'xl'
      ? 'h-24 w-24 text-4xl'
      : size === 'lg'
        ? 'h-16 w-16 text-xl'
        : 'h-10 w-10 text-sm';

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
      className={`${sizeClass} flex items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600`}
      data-testid="avatar-placeholder"
    >
      {username[0]?.toUpperCase()}
    </div>
  );
}

export default Avatar;
