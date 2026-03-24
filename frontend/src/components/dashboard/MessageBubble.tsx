import type { ChatMessageDto } from '../../types';
import { UserAvatar } from './UserAvatar';

function msgText(m: ChatMessageDto) { return m.content ?? m.message ?? ''; }
function msgSender(m: ChatMessageDto) { return m.sender ?? m.from ?? ''; }
function msgTime(m: ChatMessageDto) {
    const raw = m.timeStamp ?? m.timestamp;
    if (!raw) return '';
    try { return new Date(raw).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
}
function formatFileSize(bytes?: number) {
    if (!bytes) return '';
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface MessageBubbleProps {
    msg: ChatMessageDto;
    isMine: boolean;
    showSender: boolean;
}

export function MessageBubble({ msg, isMine, showSender }: MessageBubbleProps) {
    const isFile = !!msg.fileUrl;
    const isImage = isFile && msg.fileType?.startsWith('image/');
    const sender = msgSender(msg);

    return (
        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMine ? 'self-end flex-row-reverse' : 'self-start'}`}>
            {!isMine && showSender ? (
                <UserAvatar seed={sender} size={28} className="shrink-0 border border-white/10" />
            ) : !isMine && !showSender ? (
                <div className="w-[28px] shrink-0" />
            ) : null}

            <div className={`px-3 py-2 rounded-2xl relative break-words leading-snug w-fit ${isMine ? 'bg-[#2563eb] text-white rounded-br-sm' : 'bg-[#1f2937] text-slate-100 border border-white/5 rounded-bl-sm'}`}>
                {!isMine && showSender && (
                    <span className="block text-[11px] font-semibold text-blue-400 mb-[2px]">{sender}</span>
                )}
                
                {isImage ? (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                        <img src={msg.fileUrl} alt={msg.fileName} className="max-w-[240px] max-h-[200px] rounded-lg block mb-1 object-cover" />
                    </a>
                ) : isFile ? (
                    <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 py-1 hover:underline">
                        <span className="text-lg shrink-0">📎</span>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] text-blue-300 truncate max-w-[200px]">{msg.fileName ?? 'Attachment'}</span>
                            {msg.fileSize && <span className="text-[10px] font-mono text-slate-400">{formatFileSize(msg.fileSize)}</span>}
                        </div>
                    </a>
                ) : (
                    <span className="text-[14px] whitespace-pre-wrap">{msgText(msg)}</span>
                )}
                
                <div className="flex items-center gap-1 justify-end mt-[2px] float-right ml-3 pt-1">
                    <span className="text-[10px] font-mono text-slate-300/80">{msgTime(msg)}</span>
                    {isMine && msg.status && (
                        <span className={`text-[10px] font-mono ml-1 ${msg.status === 'READ' ? 'text-blue-300' : msg.status === 'DELIVERED' ? 'text-slate-300' : 'text-slate-400'}`}>
                            {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>
                {/* Clearfix for float-right time block */}
                <div className="clear-both"></div>
            </div>
        </div>
    );
}
