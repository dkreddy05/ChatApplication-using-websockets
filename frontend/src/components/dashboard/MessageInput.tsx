import React, { useRef, useEffect } from 'react';

interface MessageInputProps {
    connected: boolean;
    inputText: string;
    setInputText: (val: string) => void;
    onSendMessage: () => void;
    fileUploading: boolean;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MessageInput({ connected, inputText, setInputText, onSendMessage, fileUploading, onFileUpload }: MessageInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }, [inputText]);

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            if (inputText.trim() && connected) onSendMessage(); 
        }
    }

    return (
        <div className="flex items-end gap-2.5 p-3 bg-[#111827] border-t border-white/5 shrink-0">
            <button 
                className="bg-transparent border border-white/10 text-slate-400 text-lg px-2.5 py-2 rounded-xl cursor-pointer hover:bg-slate-800 hover:text-slate-200 transition-colors disabled:opacity-40 shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={fileUploading || !connected}
                title="Attach file"
            >
                {fileUploading ? (
                    <div className="w-[14px] h-[14px] border-2 border-white/20 border-t-slate-400 rounded-full animate-spin inline-block align-middle" />
                ) : '📎'}
            </button>
            <input ref={fileInputRef} type="file" hidden onChange={onFileUpload} />
            
            <textarea 
                ref={textareaRef} 
                className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-3.5 py-2.5 font-sans text-sm text-slate-100 outline-none resize-none max-h-[120px] overflow-y-auto transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                placeholder={connected ? 'Write a message…' : 'Connecting…'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={!connected}
            />
            
            <button 
                className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${inputText.trim() && connected ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)] hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer' : 'bg-slate-800 border-white/10 text-slate-500 cursor-default'}`}
                onClick={onSendMessage} 
                disabled={!inputText.trim() || !connected} 
                title="Send"
            >
                ➤
            </button>
        </div>
    );
}
