# ChatApplication-using-websockets

A modern, full-stack real-time chat application built with **Spring Boot**, **React**, and **WebSockets** (STOMP over SockJS). This application enables users to communicate privately, participate in group chats, and share files with a sleek, responsive interface.

## 🎯 Features

- **Real-Time Messaging**: Instant message delivery using WebSocket connections
- **Private Messaging**: Send direct messages to other users
- **Group Chat**: Participate in public group conversations
- **User Management**: Register, login, and manage user profiles
- **File Sharing**: Share files and media with other users
- **Message Status Tracking**: Track message delivery and read status (SENT, DELIVERED, READ)
- **Typing Indicators**: See when other users are typing
- **Emoji Support**: Rich emoji picker for expressive conversations
- **Responsive Design**: Mobile-friendly UI built with React and modern CSS
- **User Presence**: Join/leave notifications in group chats

## 🛠️ Tech Stack

### Backend
- **Java 17+** (32.2% of codebase)
- **Spring Boot**: Application framework
- **Spring WebSocket**: Real-time communication
- **STOMP Protocol**: Message broker
- **JPA/Hibernate**: ORM for database persistence
- **Jackson**: JSON serialization/deserialization

### Frontend
- **React**: UI library (31.3% TypeScript, 2% HTML, 0.3% JavaScript)
- **TypeScript**: Type-safe development
- **STOMP Client**: WebSocket communication
- **SockJS**: WebSocket fallback support
- **Axios**: HTTP client for REST API calls
- **Vite**: Build tool and dev server
- **CSS/SCSS**: Styling (34.2% of codebase)

### Database
- Relational database for message and user persistence

## 📁 Project Structure

```
ChatApplication-using-websockets/
├── src/main/java/com/web/chat/app/
│   ├── AppApplication.java                 # Spring Boot entry point
│   ├── chat/
│   │   └── domain/
│   │       ├── Message.java               # Message entity with file support
│   │       ├── MessageType.java           # Message type enumerations
│   │       └── MessageStatus.java         # Message status tracking
│   └── config/
│       └── JacksonConfig.java            # Jackson JSON configuration
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                 # Axios HTTP client with auth interceptors
│   │   ├── hooks/
│   │   │   └── useChatSocket.ts          # WebSocket hook for STOMP messaging
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript interfaces and types
│   │   ├── components/
│   │   │   └── emojiData.ts              # Emoji picker data
│   │   └── App.tsx
│   ├── vite.config.ts                    # Vite configuration with API proxying
│   ├── playwright.config.ts              # E2E testing configuration
│   └── package.json
└── pom.xml                               # Maven dependencies
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- npm or yarn
- Maven

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dkreddy05/ChatApplication-using-websockets.git
   cd ChatApplication-using-websockets
   ```

2. **Configure the database**
   - Update `src/main/resources/application.properties` with your database connection details

3. **Build the backend**
   ```bash
   mvn clean install
   ```

4. **Run the Spring Boot application**
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```
   The built frontend files will be placed in `src/main/resources/static/` for deployment with the backend.

## 🔌 WebSocket API

### Connection
- **Endpoint**: `/chat` (SockJS endpoint)
- **Protocol**: STOMP
- **Reconnect Delay**: 5 seconds

### Subscriptions

#### Public Group Messages
```typescript
stompClient.subscribe('/topic/public', (frame) => {
  const msg = JSON.parse(frame.body);
  // Handle group message
});
```

#### Private Messages
```typescript
stompClient.subscribe('/user/queue/messages', (frame) => {
  const msg = JSON.parse(frame.body);
  // Handle private message
});
```

### Publishing Messages

#### Send Private Message
```typescript
stompClient.publish({
  destination: '/app/private-message',
  body: JSON.stringify(chatMessage),
});
```

#### Send Group Message
```typescript
stompClient.publish({
  destination: '/app/room-message',
  body: JSON.stringify(chatMessage),
});
```

## 📝 Message Data Structure

```typescript
interface ChatMessageDto {
  id?: number;
  sender?: string;
  from?: string;
  recipientTo?: string;
  content?: string;
  message?: string;
  type: string; // SENT, RECEIVED, JOIN, LEAVE, CHAT, IMAGE, VIDEO, FILE, etc.
  status?: 'SENT' | 'DELIVERED' | 'READ';
  timeStamp?: string;
  timestamp?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}
```

## 🔐 Authentication & Authorization

The application includes:
- User registration and login
- Session-based authentication
- Protected routes and API endpoints
- Automatic logout on 401/403 responses
- CSRF protection

## 📱 API Endpoints

Key REST endpoints are proxied through the development server:
- `/api` - API endpoint proxy
- `/logout` - User logout
- `/css`, `/js`, `/img` - Static resources
- `/uploads` - File upload endpoint
- `/ws` - WebSocket endpoint
- `/chat` - SockJS/STOMP endpoint

## 🧪 Testing

### E2E Testing with Playwright

```bash
cd frontend
npm run test  # Run Playwright tests
```

Configuration is in `frontend/playwright.config.ts`.

## 🎨 Features in Detail

### File Sharing
- Share images, videos, and documents
- Track file metadata (type, size, URL)
- File availability in message history

### Typing Indicators
- Real-time "user is typing" notifications
- `IS_TYPING` and `STOP_TYPING` message types
- Improves chat UX with user presence feedback

### Message Status
- **SENT**: Message transmitted to server
- **DELIVERED**: Message received by recipient
- **READ**: Message read by recipient

### Emoji Picker
- 57+ emoji categories
- Quick emoji insertion in messages
- Organized by emotion and sentiment

## 🔄 Architecture

### Real-Time Flow
1. User connects via SockJS → STOMP client initializes
2. Client subscribes to `/topic/public` and `/user/queue/messages`
3. User sends message → published to `/app/private-message` or `/app/room-message`
4. Backend processes → broadcasts to subscribers
5. Connected clients receive in real-time

### Authentication Flow
1. User registers/logs in via REST API
2. Session token stored in HTTP-only cookie
3. Axios client automatically includes credentials
4. Unauthenticated requests redirect to login

## 📦 Build & Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend**
   ```bash
   mvn clean package
   ```

3. **Deploy**
   - JAR file: `target/ChatApplication-using-websockets-*.jar`
   - Run: `java -jar target/ChatApplication-using-websockets-*.jar`
   - Frontend assets are embedded in the JAR at `static/`

## 📄 Configuration

### Backend (application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/chatapp
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

### Frontend (vite.config.ts)
- Dev server port: `5173`
- Build output: `../src/main/resources/static`
- API proxy target: `http://localhost:8080`

## 🚨 Common Issues & Solutions

### WebSocket Connection Failed
- Ensure backend is running on `http://localhost:8080`
- Check proxy configuration in `vite.config.ts`
- Verify `/chat` endpoint is accessible

### CORS Issues
- Backend should allow credentials
- Check `changeOrigin: true` in proxy config

### Session Loss
- Verify `withCredentials: true` in Axios client
- Check HTTP-only cookie settings

## 📄 License

This project is open source and available on GitHub.

## 👤 Author

**dkreddy05** - [GitHub Profile](https://github.com/dkreddy05)

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions, please open an [issue](https://github.com/dkreddy05/ChatApplication-using-websockets/issues) on GitHub.

---

**Happy chatting! 💬**
