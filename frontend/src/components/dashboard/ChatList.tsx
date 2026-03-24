import type { ChatUserResponse } from '../../types';
import { ChatItem } from './ChatItem';

interface ChatListProps {
    contacts: ChatUserResponse[];
    activeChatMode: 'group' | 'private';
    activeChatUser?: ChatUserResponse;
    unread: Record<string, number>;
    onSelectChat: (user: ChatUserResponse | 'group') => void;
}

export function ChatList({ contacts, activeChatMode, activeChatUser, unread, onSelectChat }: ChatListProps) {
    const groupUnread = unread['__group__'] ?? 0;

    return (
        <ul className="flex-1 overflow-y-auto overflow-x-hidden p-1 w-full m-0 list-none">
            <li 
                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-l-2 ${activeChatMode === 'group' ? 'bg-[#0f172a] border-[#3b82f6]' : 'border-transparent hover:bg-[#0f172a]/60'}`}
                onClick={() => onSelectChat('group')}
            >
                <div className="relative shrink-0 w-[42px] h-[42px] rounded-full bg-slate-700 flex items-center justify-center text-xl border border-slate-600">
                    🌐
                    {groupUnread > 0 && activeChatMode !== 'group' && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full shrink-0">
                            {groupUnread > 99 ? '99+' : groupUnread}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">Global Chat</div>
                    <div className="text-xs text-slate-400">Everyone</div>
                </div>
            </li>
            
            {contacts.map((u) => (
                <ChatItem 
                    key={u.nickname} 
                    user={u}
                    active={activeChatMode === 'private' && activeChatUser?.nickname === u.nickname}
                    unread={unread[u.nickname] ?? 0} 
                    onClick={() => onSelectChat(u)} 
                />
            ))}
        </ul>
    );
}
