import type { ChatUserResponse } from '../../types';

interface UserAvatarProps {
    user?: ChatUserResponse;
    size?: number;
    className?: string;
    onClick?: () => void;
    seed?: string;
}

export function UserAvatar({ user, size = 40, className = '', onClick, seed }: UserAvatarProps) {
    const s = seed ?? user?.nickname ?? 'G';
    const bgUrl = user?.profilePictureUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s)}&backgroundColor=0f172a`;

    return (
        <img
            src={bgUrl}
            alt={user?.nickname ?? 'Avatar'}
            className={`rounded-full object-cover ${className}`}
            style={{ width: size, height: size, minWidth: size, cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        />
    );
}
