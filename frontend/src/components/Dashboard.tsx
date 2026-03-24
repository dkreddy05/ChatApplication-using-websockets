import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getCurrentUser,
    getPrivateHistory,
    getGroupHistory,
    uploadMessageFile,
    logoutUser
} from '../api/services';
import { useChatSocket } from '../hooks/useChatSocket';
import type { ChatMessageDto, ChatUserResponse, ActiveChat } from '../types';

// UI Components
import { Sidebar } from './dashboard/Sidebar';
import { ChatHeader } from './dashboard/ChatHeader';
import { MessageList } from './dashboard/MessageList';
import { MessageInput } from './dashboard/MessageInput';
import { ProfileSettingsModal } from './dashboard/ProfileSettingsModal';

export default function Dashboard() {
  const nav = useNavigate();
  const [currentUser, setCurrentUser] = useState<ChatUserResponse | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat>({ mode: 'group' });
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [contacts, setContacts] = useState<ChatUserResponse[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileUploading, setFileUploading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const activeChatRef = useRef(activeChat);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  // Handle STOMP messaging via custom hook
  const handleGroupMessage = useCallback((msg: ChatMessageDto) => {
    if (activeChatRef.current.mode === 'group') {
      setMessages((prev) => [...prev, msg]);
    } else {
      setUnread((u) => ({ ...u, __group__: (u.__group__ ?? 0) + 1 }));
    }
  }, []);

  const handlePrivateMessage = useCallback((msg: ChatMessageDto) => {
    const sender = msg.sender || msg.from || '';
    const chat = activeChatRef.current;
    if (chat.mode === 'private' && chat.user?.nickname === sender) {
      setMessages((prev) => [...prev, msg]);
    } else if (sender !== currentUser?.nickname) {
      setUnread((u) => ({ ...u, [sender]: (u[sender] ?? 0) + 1 }));
    }
    
    // Add to contacts if missing
    setContacts((prev) => {
      if (prev.some((c) => c.nickname === sender)) return prev;
      return [{ nickname: sender } as ChatUserResponse, ...prev];
    });
  }, [currentUser]);

  const { isConnected: connected, error: wsError, sendGroupMessage, sendPrivateMessage } = useChatSocket({
    currentUser: currentUser?.nickname ?? null,
    onGroupMessage: handleGroupMessage,
    onPrivateMessage: handlePrivateMessage,
  });

  // On mount - get profile
  useEffect(() => {
    getCurrentUser()
      .then((res: any) => setCurrentUser(res))
      .catch(() => nav('/login'));
  }, [nav]);

  // Load history on chat switch
  useEffect(() => {
    if (!currentUser) return;
    setMessages([]);
    setLoadingHistory(true);
    setGlobalError('');
    
    // Clear unread
    if (activeChat.mode === 'group') {
      setUnread((u) => ({ ...u, __group__: 0 }));
    } else if (activeChat.user) {
      setUnread((u) => ({ ...u, [activeChat.user!.nickname]: 0 }));
    }
    
    const fetch = activeChat.mode === 'group'
      ? getGroupHistory()
      : getPrivateHistory(currentUser.nickname, activeChat.user!.nickname);
      
    fetch
      .then((res: any) => setMessages(res))
      .catch(() => setGlobalError('Failed to load chat history'))
      .finally(() => setLoadingHistory(false));
  }, [activeChat, currentUser]);

  // UI Actions
  function openChat(user: ChatUserResponse | 'group') {
    if (user === 'group') {
      setActiveChat({ mode: 'group' });
    } else {
      setActiveChat({ mode: 'private', user });
      if (!contacts.some(c => c.nickname === user.nickname)) {
        setContacts(prev => [user, ...prev]);
      }
    }
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  async function sendMessage() {
    if (!inputText.trim() || !currentUser) return;
    const base: ChatMessageDto = {
      type: 'CHAT', 
      content: inputText.trim(),
      sender: currentUser.nickname, 
      status: 'SENT',
      timeStamp: new Date().toISOString(),
    };
    setInputText('');
    
    if (activeChat.mode === 'group') {
      setMessages((p) => [...p, base]);
      sendGroupMessage(base);
    } else {
      const msg = { ...base, recipientTo: activeChat.user!.nickname };
      setMessages((p) => [...p, msg]);
      sendPrivateMessage(msg);
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setFileUploading(true);
    try {
      const res: any = await uploadMessageFile(file);
      const fileUrl = res.fileUrl;
      const fileName = res.fileName;
      const fileType = res.fileType;
      const fileSize = res.fileSize;
      const msg: ChatMessageDto = {
        type: 'CHAT', 
        sender: currentUser.nickname,
        fileUrl, 
        fileName, 
        fileType, 
        fileSize,
        status: 'SENT', 
        timeStamp: new Date().toISOString(),
        recipientTo: activeChat.mode === 'private' ? activeChat.user?.nickname : undefined,
      };
      setMessages((p) => [...p, msg]);
      if (activeChat.mode === 'group') sendGroupMessage(msg);
      else sendPrivateMessage(msg);
    } catch { setGlobalError('File upload failed'); }
    finally { setFileUploading(false); e.target.value = ''; }
  }

  async function handleLogout() {
    try { await logoutUser(); } catch { /* ignore */ }
    nav('/login');
  }

  if (!currentUser) return null;

  return (
    <div className="flex bg-[#0f172a] h-screen w-screen overflow-hidden text-slate-100 font-sans">
      <div className={`fixed md:relative z-20 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar 
          open={sidebarOpen}
          currentUser={currentUser}
          connected={connected}
          contacts={contacts}
          activeChatMode={activeChat.mode}
          activeChatUser={activeChat.user}
          unread={unread}
          onSelectChat={openChat}
          onShowProfile={() => setShowProfile(true)}
          onLogout={handleLogout}
        />
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 bg-[#111827]">
        <ChatHeader 
          activeChatMode={activeChat.mode}
          activeChatUser={activeChat.user}
          connected={connected}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        />

        {(globalError || wsError) && (
          <div className="flex items-center justify-between p-2.5 text-xs bg-red-500/15 text-red-500 border-b border-red-500/30 shrink-0">
            <span>⚠ {globalError || wsError}</span>
            <button className="bg-transparent border-none text-red-500 cursor-pointer text-sm p-1 ml-2" onClick={() => setGlobalError('')}>✕</button>
          </div>
        )}

        <MessageList 
          messages={messages}
          loadingHistory={loadingHistory}
          activeChatMode={activeChat.mode}
          currentUser={currentUser}
        />

        <MessageInput 
          connected={connected}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={sendMessage}
          fileUploading={fileUploading}
          onFileUpload={handleFileUpload}
        />
      </main>

      {showProfile && (
        <ProfileSettingsModal 
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onUpdated={(u: ChatUserResponse) => { setCurrentUser(u); setShowProfile(false); }}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
