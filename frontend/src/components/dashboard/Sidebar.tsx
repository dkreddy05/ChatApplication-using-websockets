import { useState, useEffect } from 'react';
import type { ChatUserResponse } from '../../types';
import { searchUsers } from '../../api/services';
import { UserAvatar } from './UserAvatar';
import { ChatList } from './ChatList';

interface SidebarProps {
  currentUser: ChatUserResponse | null;
  connected: boolean;
  contacts: ChatUserResponse[];
  activeChatMode: 'group' | 'private';
  activeChatUser?: ChatUserResponse;
  unread: Record<string, number>;
  onSelectChat: (user: ChatUserResponse | 'group') => void;
  onShowProfile: () => void;
  onLogout: () => void;
  open: boolean;
}

function getDisplayName(u?: ChatUserResponse) {
    if (!u) return 'Group Chat';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.nickname;
}

export function Sidebar({
    open,
    currentUser,
    connected,
    contacts,
    activeChatMode,
    activeChatUser,
    unread,
    onSelectChat,
    onShowProfile,
    onLogout
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatUserResponse[]>([]);

    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const t = setTimeout(() => {
            searchUsers(searchQuery).then((r: ChatUserResponse[]) => setSearchResults(r)).catch(() => { });
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    function handleSelectSearchResult(u: ChatUserResponse) {
        onSelectChat(u);
        setSearchQuery('');
        setSearchResults([]);
    }

    return (
        <aside className={`flex flex-col bg-[#020617] border-r border-white/5 w-[300px] shrink-0 transition-all duration-300 ${open ? 'ml-0' : '-ml-[300px] overflow-hidden'}`}>
            <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0 h-[72px]">
                <button 
                    className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer text-slate-200 p-1.5 rounded-lg transition-colors flex-1 text-left hover:bg-[#0f172a]"
                    onClick={onShowProfile}
                >
                    <UserAvatar user={currentUser ?? undefined} size={36} className="border-2 border-slate-700 pointer-events-none" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[13px] font-semibold text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">{getDisplayName(currentUser ?? undefined)}</span>
                        <span className="text-[11px] text-slate-500">@{currentUser?.nickname}</span>
                    </div>
                </button>
                <div 
                    className={`shrink-0 w-2.5 h-2.5 rounded-full border-2 border-[#020617] ${connected ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-slate-500'}`} 
                    title={connected ? 'Connected' : 'Disconnected'} 
                />
            </div>

            <div className="relative p-3 shrink-0">
                <span className="absolute left-[26px] top-1/2 -translate-y-1/2 text-[13px] pointer-events-none">🔍</span>
                <input 
                    className="w-full bg-[#0f172a] border border-white/5 rounded-full py-1.5 pl-8 pr-3 font-sans text-[13px] text-slate-100 outline-none transition-all placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                    placeholder="Search users…"
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                {searchQuery && (
                    <button 
                        className="absolute right-5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-500 text-[12px] cursor-pointer p-0.5 rounded transition-colors hover:text-slate-400" 
                        onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    >✕</button>
                )}
            </div>

            {searchResults.length > 0 && (
                <ul className="list-none bg-slate-900 border border-white/5 rounded-lg mx-3 mb-2 p-1 overflow-y-auto max-h-[180px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    {searchResults.map((u) => (
                        <li 
                            key={u.nickname} 
                            className="flex items-center gap-2.5 p-2 cursor-pointer transition-colors hover:bg-[#0f172a] rounded-md" 
                            onClick={() => handleSelectSearchResult(u)}
                        >
                            <UserAvatar user={u} size={32} />
                            <div>
                                <h2 className="text-white font-medium text-lg leading-tight">{getDisplayName(u)}</h2>
                                <div className="text-[11px] text-slate-500">@{u.nickname}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ChatList 
                contacts={contacts}
                activeChatMode={activeChatMode}
                activeChatUser={activeChatUser}
                unread={unread}
                onSelectChat={onSelectChat}
            />

            <div className="p-3 border-t border-white/5 shrink-0">
                <button 
                    className="w-full flex items-center gap-2 bg-transparent border border-white/5 text-slate-400 font-sans text-[13px] p-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-800/80 hover:text-slate-200 focus:outline-none" 
                    onClick={onLogout}
                >
                    <span className="text-[15px]">⎋</span> Sign out
                </button>
            </div>
        </aside>
    );
}
