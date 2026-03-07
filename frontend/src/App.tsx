import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { Send, User } from 'lucide-react';

interface ChatUser {
  nickname: string;
  email: string;
}

interface Message {
  id?: number;
  sender: string;
  recipientTo?: string;
  content: string;
  type: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  timeStamp: string;
}

function App() {
  const [user, setUser] = useState<ChatUser | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<string>('global');
  const [newMessage, setNewMessage] = useState('');

  const stompClient = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    axios.get('/api/user/')
      .then(res => setUser(res.data))
      .catch(err => console.error("Could not fetch user. Make sure you are logged in.", err));
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/chat'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');

        // Subscribe to global messages
        client.subscribe('/topic/public', (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages(prev => [...prev, newMsg]);
        });

        // Subscribe to active users
        client.subscribe('/topic/active-users', (msg) => {
          setActiveUsers(JSON.parse(msg.body));
        });

        // Subscribe to private messages
        client.subscribe('/user/queue/private', (msg) => {
          const newMsg = JSON.parse(msg.body);
          setMessages(prev => {
            // Check if we already have this message 
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // SEND DELIVERED RECEIPT IMMEDIATELY!
          if (newMsg.sender !== user.nickname) {
            client.publish({
              destination: '/app/message-status',
              body: JSON.stringify({
                id: newMsg.id,
                status: 'DELIVERED'
              })
            });
          }
        });

        // Subscribe to status updates (read receipts)
        client.subscribe('/user/queue/status-updates', (msg) => {
          const statusUpdate = JSON.parse(msg.body);
          setMessages(prev => prev.map(m =>
            m.id === statusUpdate.id ? { ...m, status: statusUpdate.status } : m
          ));
        });

        // Announce presence
        client.publish({
          destination: '/app/new-User',
          body: JSON.stringify({ sender: user.nickname, type: 'JOIN' }),
        });
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [user]);

  // Send READ receipts when chat changes or messages arrive
  useEffect(() => {
    if (!stompClient.current || !stompClient.current.connected || currentChat === 'global') return;

    // Find messages from the current chat that are not 'READ' and we are the recipient
    const unreadMessages = messages.filter(
      m => m.sender === currentChat && m.status !== 'READ'
    );

    unreadMessages.forEach(msg => {
      stompClient.current?.publish({
        destination: '/app/message-status',
        body: JSON.stringify({ id: msg.id, status: 'READ' })
      });
      // Update local state proactively
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, status: 'READ' } : m
      ));
    });
  }, [messages, currentChat]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !stompClient.current || !user) return;

    const chatMessage = {
      sender: user.nickname,
      content: newMessage,
      type: 'CHAT',
      status: 'SENT',
      timeStamp: new Date().toISOString()
    };

    if (currentChat === 'global') {
      stompClient.current.publish({
        destination: '/app/room-message',
        body: JSON.stringify(chatMessage)
      });
    } else {
      stompClient.current.publish({
        destination: '/app/private-message',
        body: JSON.stringify({
          ...chatMessage,
          recipientTo: currentChat,
          type: 'PRIVATE'
        })
      });
    }

    setNewMessage('');
  };

  const visibleMessages = messages.filter(m =>
    currentChat === 'global'
      ? m.type === 'CHAT' || m.type === 'JOIN'
      : (m.sender === currentChat && m.recipientTo === user?.nickname) ||
      (m.sender === user?.nickname && m.recipientTo === currentChat)
  );

  const renderCheckmarks = (status: 'SENT' | 'DELIVERED' | 'READ') => {
    switch (status) {
      case 'SENT': return <span className="status-checks sent">✓</span>;
      case 'DELIVERED': return <span className="status-checks delivered">✓✓</span>;
      case 'READ': return <span className="status-checks read">✓✓</span>;
      default: return null;
    }
  };

  if (!user) return <div className="loading">Please ensure you are logged into Spring Boot first...</div>;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <div className="user-profile">
            <div className="avatar">{user.nickname.charAt(0)}</div>
            <div className="user-info">
              <h3>{user.nickname}</h3>
              <div className="status-online">Online</div>
            </div>
          </div>
        </header>

        <div className="chat-list">
          <div
            className={`chat-item ${currentChat === 'global' ? 'active' : ''}`}
            onClick={() => setCurrentChat('global')}
          >
            <div className="avatar" style={{ background: '#475569' }}>G</div>
            <div className="user-info">
              <h3>Global Chat</h3>
            </div>
          </div>

          <div style={{ margin: '20px 0 10px 10px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Active Users ({activeUsers.length})
          </div>

          {activeUsers.filter(u => u !== user.nickname).map(activeUser => (
            <div
              key={activeUser}
              className={`chat-item ${currentChat === activeUser ? 'active' : ''}`}
              onClick={() => setCurrentChat(activeUser)}
            >
              <div className="avatar"><User size={20} /></div>
              <div className="user-info">
                <h3>{activeUser}</h3>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <main className="chat-area">
        <header className="chat-header">
          <div className="avatar">{currentChat === 'global' ? 'G' : currentChat.charAt(0).toUpperCase()}</div>
          <h2>{currentChat === 'global' ? 'Global Room' : currentChat}</h2>
        </header>

        <div className="messages-container">
          {visibleMessages.map((msg, idx) => {
            const isMe = msg.sender === user.nickname;
            return (
              <div key={idx} className={`message ${isMe ? 'sent' : 'received'}`}>
                {!isMe && currentChat === 'global' && (
                  <div style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold', marginBottom: '4px' }}>
                    {msg.sender}
                  </div>
                )}
                <div>{msg.content}</div>
                <div className="message-meta">
                  {new Date(msg.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && currentChat !== 'global' && renderCheckmarks(msg.status)}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="message-input-area">
          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              className="message-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" className="send-btn">
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
