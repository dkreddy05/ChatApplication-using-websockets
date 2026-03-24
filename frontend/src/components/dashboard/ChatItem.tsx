import type { ChatUserResponse } from '../../types';
import { UserAvatar } from './UserAvatar';

function getDisplayName(u?: ChatUserResponse) {
    if (!u) return 'Group Chat';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.nickname;
}

interface ChatItemProps {
    user: ChatUserResponse;
    active: boolean;
    unread: number;
    onClick: () => void;
}

export function ChatItem({ user, active, unread, onClick }: ChatItemProps) {
    return (
        <li 
            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-l-2 ${active ? 'bg-[#0f172a] border-[#3b82f6]' : 'border-transparent hover:bg-[#0f172a]/60'}`} 
            onClick={onClick}
        >
            <div className="relative shrink-0">
                <UserAvatar user={user} size={42} />
                {unread > 0 && !active && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full shrink-0">
                        {unread > 99 ? '99+' : unread}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{getDisplayName(user)}</div>
                <div className="text-xs text-slate-400 truncate">@{user.nickname}</div>
            </div>
        </li>
    );
}
