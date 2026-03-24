import React, { useEffect, useRef } from 'react';
import type { ChatMessageDto, ChatUserResponse } from '../../types';
import { MessageBubble } from './MessageBubble';

function msgTime(m: ChatMessageDto) {
    const raw = m.timeStamp ?? m.timestamp;
    if (!raw) return '';
    try { return new Date(raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
}

function msgDateLabel(m: ChatMessageDto): string {
    const raw = m.timeStamp ?? m.timestamp;
    if (!raw) return '';
    try {
        const d = new Date(raw);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
}

function msgSender(m: ChatMessageDto) { return m.sender ?? m.from ?? ''; }

function DateSeparator({ label }: { label: string }) {
    return (
        <div className="flex items-center justify-center p-3 pb-1 pointer-events-none sticky top-0 z-10">
            <span className="text-[11px] font-mono text-slate-400 bg-[#111827] border border-white/5 px-2.5 py-0.5 rounded-full shadow-sm">
                {label}
            </span>
        </div>
    );
}

interface MessageListProps {
    messages: ChatMessageDto[];
    loadingHistory: boolean;
    activeChatMode: 'group' | 'private';
    currentUser: ChatUserResponse | null;
}

export function MessageList({ messages, loadingHistory, activeChatMode, currentUser }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function shouldShowDate(i: number): string | null {
        const cur = msgDateLabel(messages[i]);
        if (!cur) return null;
        if (i === 0) return cur;
        return msgDateLabel(messages[i - 1]) !== cur ? cur : null;
    }

    if (loadingHistory) {
        return (
            <div className="flex-1 flex items-center justify-center gap-2.5 text-sm text-slate-400 bg-[#111827]">
                <div className="w-[32px] h-[32px] border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2.5 text-sm text-slate-400 bg-[#111827]">
                <span className="text-4xl">{activeChatMode === 'group' ? '🌐' : '💬'}</span>
                <span>No messages yet. Say something! 👋</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-0.5 bg-[#111827] bg-[radial-gradient(ellipse_at_80%_10%,rgba(59,130,246,0.06)_0%,transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(37,99,235,0.05)_0%,transparent_55%)]">
            {messages.map((msg, i) => {
                const isMine = currentUser ? msgSender(msg) === currentUser.nickname : false;
                const showSender = activeChatMode === 'group' && !isMine
                    && (i === 0 || msgSender(messages[i - 1]) !== msgSender(msg));
                const dateLabel = shouldShowDate(i);
                
                return (
                    <React.Fragment key={msg.id ?? `${msgTime(msg)}-${i}`}>
                        {dateLabel && <DateSeparator label={dateLabel} />}
                        <MessageBubble msg={msg} isMine={isMine} showSender={showSender} />
                    </React.Fragment>
                );
            })}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
