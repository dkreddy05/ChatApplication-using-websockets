import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ChatUserResponse } from '../../types';
import { updateNickname, uploadProfilePictureFile, updateProfilePicture, getCurrentUser } from '../../api/services';
import { UserAvatar } from './UserAvatar';

function getDisplayName(u?: ChatUserResponse) {
    if (!u) return 'Group Chat';
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.nickname;
}

interface ProfileSettingsModalProps {
    user: ChatUserResponse;
    onClose: () => void;
    onUpdated: (u: ChatUserResponse) => void;
    onLogout: () => void;
}

export function ProfileSettingsModal({ user, onClose, onUpdated, onLogout }: ProfileSettingsModalProps) {
    const [nickname, setNickname] = useState(user.nickname);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    async function saveNickname() {
        if (!nickname.trim() || nickname.trim() === user.nickname) return;
        setSaving(true); setErr('');
        try {
            await updateNickname(nickname.trim());
            onUpdated({ ...user, nickname: nickname.trim() });
            onClose();
        } catch { setErr('Failed to update nickname'); }
        finally { setSaving(false); }
    }

    async function handlePicture(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true); setErr('');
        try {
            const url = await uploadProfilePictureFile(file);
            await updateProfilePicture(url);
            
            const res = await getCurrentUser();
            onUpdated(res);
        } catch { setErr('Failed to upload picture'); }
        finally { setSaving(false); }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center" onClick={onClose}>
            <div className="bg-[#111827] border border-white/5 rounded-2xl w-[360px] max-w-[90vw] p-7 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="absolute top-4 right-4 bg-slate-800 border border-white/5 text-slate-400 w-7 h-7 rounded-full flex items-center justify-center text-xs hover:bg-slate-700 hover:text-slate-200 transition-colors" 
                    onClick={onClose}
                >
                    ✕
                </button>
                
                <div className="flex flex-col items-center gap-1.5 mb-5 relative">
                    <div className="relative w-[72px] h-[72px]">
                        <UserAvatar user={user} size={72} className="border-[3px] border-[#3b82f6]/20" />
                        <button 
                            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-blue-500 border-2 border-[#111827] text-[11px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" 
                            onClick={() => fileRef.current?.click()}
                            disabled={saving}
                            title="Update photo"
                        >
                            {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : '📷'}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePicture} />
                    </div>
                    <div className="text-base font-semibold text-slate-100 mt-1">{getDisplayName(user)}</div>
                    <div className="text-xs text-slate-400">{user.email || 'No email provided'}</div>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Nickname</label>
                    <input 
                        value={nickname} 
                        onChange={(e) => setNickname(e.target.value)}
                        disabled={saving} 
                        onKeyDown={(e) => e.key === 'Enter' && saveNickname()}
                        className="bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                
                {err && <div className="text-xs text-red-500 mb-2.5 bg-red-500/10 px-3 py-2 rounded-md">{err}</div>}
                
                <button 
                    className="w-full py-2.5 bg-blue-600 rounded-lg text-white font-semibold text-sm transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50" 
                    onClick={saveNickname} 
                    disabled={saving || nickname.trim() === user.nickname}
                >
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
                
                <button 
                    className="w-full bg-transparent border border-red-500/30 rounded-lg text-red-500 text-sm py-2.5 mt-3 flex items-center justify-between px-3.5 hover:bg-red-500/10 hover:border-red-500 transition-colors" 
                    onClick={onLogout}
                >
                    <span>Sign out</span>
                    <span className="text-base">→</span>
                </button>
            </div>
        </div>
    );
}
