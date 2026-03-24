import type { ChatUserResponse } from '../../types';
import { UserAvatar } from './UserAvatar';

function getDisplayName(u?: ChatUserResponse) {
    if (!u) return 'Group Chat';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.nickname;
}

interface ChatHeaderProps {
    activeChatMode: 'group' | 'private';
    activeChatUser?: ChatUserResponse;
    connected: boolean;
    onToggleSidebar: () => void;
}

export function ChatHeader({ activeChatMode, activeChatUser, connected, onToggleSidebar }: ChatHeaderProps) {
    const chatTitle = activeChatMode === 'group' ? '# Global Chat' : getDisplayName(activeChatUser);
    const chatSubtitle = activeChatMode === 'group'
        ? 'Everyone is here'
        : activeChatUser?.email ?? activeChatUser?.nickname ?? '';

    return (
        <div className="flex items-center gap-3 p-3 bg-[#111827] border-b border-white/5 shrink-0 h-[60px]">
            <button 
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 p-2 rounded-md transition-colors leading-none md:hidden"
                onClick={onToggleSidebar}
            >
                ☰
            </button>
            <div className="shrink-0 flex items-center justify-center">
                {activeChatMode === 'group' ? (
                    <div className="w-[34px] h-[34px] rounded-full bg-blue-500/20 border border-white/10 flex items-center justify-center text-sm">
                        🌐
                    </div>
                ) : (
                    <UserAvatar user={activeChatUser} size={34} className="border border-white/10" />
                )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[15px] font-semibold text-slate-100 truncate">{chatTitle}</span>
                <span className="text-[12px] text-slate-400 truncate">{chatSubtitle}</span>
            </div>
            {!connected && (
                <span className="text-[11px] font-mono bg-amber-500/15 text-amber-500 px-2 py-1 rounded-full border border-amber-500/30 animate-pulse whitespace-nowrap">
                    Reconnecting…
                </span>
            )}
        </div>
    );
}
