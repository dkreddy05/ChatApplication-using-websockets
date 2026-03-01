'use strict'

let stompClient
let chatUser
let user
let isActive = true;
let connection = false;
let currentRecipient = null; // null means global chat

// A map to store active private chats in the sidebar
// key: nickname, value: preview text
const activeChats = new Map();

// Update connection status UI
function updateConnectionStatus(isConnected) {
    const indicator = document.getElementById('conn-status-indicator');
    const statusText = document.getElementById('current-chat-status');
    if (isConnected) {
        indicator.innerHTML = '<i class="fas fa-circle" style="color: #32c787;"></i> Connected';
        statusText.innerHTML = 'Online';
    } else {
        indicator.innerHTML = '<i class="fas fa-circle" style="color: #ff595e;"></i> Disconnected';
        statusText.innerHTML = 'Offline';
    }
}

// Show/Hide Account Details
document.getElementById('account-details-button').addEventListener('click', () => {
    document.querySelector('.information-details-container').classList.toggle('hide');
});

async function GetUserInfo() {
    let url = '/api/user/';
    try {
        let res = await fetch(url, { method: 'GET' });
        if (res.ok) {
            return await res.json();
        } else {
            console.error(`HTTP error: ${res.status}`);
        }
    } catch (err) {
        console.error(err);
    }
}

GetUserInfo().then(data => {
    if (data) {
        updateChatUser(data)
        fillUserInformation();
    }
});

function fillUserInformation() {
    $('#user-name').html(chatUser.name);
    $('#user-name-header').html(chatUser.name);
    $('#user-email').html(chatUser.email);
    $('#user-nickname').html(chatUser.nickname);
    $('#avatar-initial').html(chatUser.nickname.charAt(0).toUpperCase());
    document.querySelector('.img_cont_ava').style.background = getAvatarColor(chatUser.nickname);
    user = chatUser.nickname; // initialize user
}

function updateChatUser(data) {
    chatUser = {
        name: data.firstname + " " + data.lastname,
        nickname: data.nickname,
        email: data.email
    }
}

async function handleSetUserNickname(event) {
    event.preventDefault();
    let prevNickname = chatUser.nickname;
    let nickname = $('#nickname').val();
    let form = event.currentTarget;
    let url = form.action;

    await doChangeNicknameRequest(url, prevNickname, nickname);
}

async function doChangeNicknameRequest(url, prevNickname, nickname) {
    chatUser.nickname = nickname;

    let fetchOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chatUser),
    };

    let res = await fetch(url, fetchOptions);

    if (res.ok) {
        $('#user-nickname').html(nickname);
        $('#avatar-initial').html(nickname.charAt(0).toUpperCase());
        document.querySelector('.img_cont_ava').style.background = getAvatarColor(nickname);
        user = nickname;
        if (stompClient) {
            sendMessageChangeNickname(prevNickname);
        }
        addNotification(createNotification("Nickname successfully changed", "success-notification"));
    } else {
        res.json().then((data) => {
            addNotification(createNotification(data.message, "fail-notification"));
        });
    }
}


const connect = (event) => {
    user = document.querySelector('#user-nickname').textContent;

    if (user && !connection) {
        connection = true;
        const socket = new SockJS('/chat')
        stompClient = Stomp.over(socket)
        stompClient.connect({}, onConnected, onError)
    }
    if (event) event.preventDefault()
}

const disconnect = (event) => {
    if (connection) {
        connection = false;
        stompClient.disconnect()
        updateConnectionStatus(false);
    }
    if (event) event.preventDefault()
}

const onConnected = () => {
    updateConnectionStatus(true);
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.subscribe('/user/queue/private', onPrivateMessageReceived);
    stompClient.subscribe('/topic/active-users', onActiveUsersReceived);

    stompClient.send("/app/active-users", {}, ""); // Request active users initially

    stompClient.send(
        "/app/new-User",
        {},
        JSON.stringify({ from: user, type: 'CONNECT' })
    )
}

const onActiveUsersReceived = (payload) => {
    const activeUsersList = JSON.parse(payload.body);
    renderActiveUsers(activeUsersList);
}

const renderActiveUsers = (activeUsersList) => {
    const container = document.getElementById('active-users-list');
    const countSpan = document.getElementById('active-users-count');

    if (container) {
        container.innerHTML = '';
        const otherUsers = activeUsersList.filter(u => u !== user);

        if (countSpan) {
            countSpan.textContent = activeUsersList.length;
        }

        if (otherUsers.length === 0) {
            container.innerHTML = '<div style="padding: 5px 15px; font-size: 0.85rem; color: rgba(255,255,255,0.4);">No one else is online</div>';
            return;
        }

        otherUsers.forEach(u => {
            const div = document.createElement('div');
            div.className = 'chat-list-item';
            div.style.padding = '8px 15px';
            const avatarColor = getAvatarColor(u);

            div.innerHTML = `
                <div class="chat-item-avatar" style="background: ${avatarColor}; width: 30px; height: 30px; font-size: 0.8rem;">${u.charAt(0).toUpperCase()}</div>
                <div class="chat-item-info">
                    <div class="chat-item-name" style="font-size: 0.9rem;">${u}</div>
                </div>
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #32c787; margin-left: auto;"></div>
            `;

            div.addEventListener('click', () => {
                openPrivateChat(u);
            });

            container.appendChild(div);
        });
    }
}

const onError = (error) => {
    document.getElementById('current-chat-status').innerHTML = 'Connection lost. Reload.';
    updateConnectionStatus(false);
}

// DM Search Logic
const dmForm = document.querySelector('#dm-form');
const dmRecipient = document.querySelector('#dm-recipient');
const searchResults = document.querySelector('#search-results');
let searchTimeout;

if (dmRecipient) {
    dmRecipient.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (!query) {
            searchResults.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`/api/Users/search?query=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const users = await response.json();
                    renderSearchResults(users);
                }
            } catch (error) {
                console.error("Search failed:", error);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#dm-form')) {
            searchResults.style.display = 'none';
        }
    });
}

function renderSearchResults(users) {
    searchResults.innerHTML = '';
    const filteredUsers = users.filter(u => u.nickname !== user);

    if (filteredUsers.length === 0) {
        searchResults.style.display = 'block';
        searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted); text-align: center; font-size: 0.9rem;">No users found</div>';
        return;
    }

    filteredUsers.forEach(u => {
        const div = document.createElement('div');
        div.style.padding = '10px 15px';
        div.style.cursor = 'pointer';
        div.style.borderBottom = '1px solid var(--panel-border)';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '10px';
        div.style.fontSize = '0.9rem';
        div.onmouseover = () => div.style.backgroundColor = 'rgba(255,255,255,0.05)';
        div.onmouseout = () => div.style.backgroundColor = 'transparent';

        const avatarColor = getAvatarColor(u.nickname);
        const avatarHtml = `<div style="width: 28px; height: 28px; border-radius: 50%; background: ${avatarColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size:0.8rem;">${u.nickname[0].toUpperCase()}</div>`;

        div.innerHTML = `${avatarHtml} <span style="color: white;">${u.nickname}</span>`;

        div.addEventListener('click', () => {
            dmRecipient.value = '';
            searchResults.style.display = 'none';
            openPrivateChat(u.nickname);
        });

        searchResults.appendChild(div);
    });

    searchResults.style.display = 'block';
}

function openPrivateChat(nickname) {
    if (!activeChats.has(nickname)) {
        activeChats.set(nickname, "Started chat");
        addChatToSidebar(nickname);
    }
    switchToChat(nickname);
}

function addChatToSidebar(nickname) {
    const chatList = document.getElementById('sidebar-chat-list');

    const div = document.createElement('div');
    div.className = 'chat-list-item';
    div.id = `chat-item-${nickname}`;
    div.dataset.recipient = nickname;

    const avatarColor = getAvatarColor(nickname);

    div.innerHTML = `
        <div class="chat-item-avatar" style="background: ${avatarColor};">${nickname.charAt(0).toUpperCase()}</div>
        <div class="chat-item-info">
            <div class="chat-item-name">${nickname}</div>
            <div class="chat-item-last-msg" id="last-msg-${nickname}">${activeChats.get(nickname)}</div>
        </div>
    `;

    div.addEventListener('click', () => switchToChat(nickname));
    chatList.appendChild(div);
}

function switchToChat(recipient) {
    currentRecipient = recipient === 'global' ? null : recipient;

    document.querySelectorAll('.chat-list-item').forEach(el => el.classList.remove('active'));
    const targetId = currentRecipient ? `chat-item-${currentRecipient}` : 'chat-item-global';
    const targetEl = document.getElementById(targetId);
    if (targetEl) targetEl.classList.add('active');

    if (currentRecipient) {
        document.getElementById('current-chat-name').textContent = currentRecipient;
        const avatarColor = getAvatarColor(currentRecipient);
        document.getElementById('current-chat-avatar').innerHTML = currentRecipient.charAt(0).toUpperCase();
        document.getElementById('current-chat-avatar').style.background = avatarColor;
    } else {
        document.getElementById('current-chat-name').textContent = "Global Chat Room";
        document.getElementById('current-chat-avatar').innerHTML = '<i class="fas fa-globe"></i>';
        document.getElementById('current-chat-avatar').style.background = 'linear-gradient(135deg, #3390ec, #2481cc)';
    }

    document.getElementById('chat').innerHTML = '';
}

document.getElementById('chat-item-global').addEventListener('click', () => {
    switchToChat('global');
});


const sendMessage = (event) => {
    event.preventDefault();
    const messageInput = document.querySelector('#message')
    const messageContent = messageInput.value.trim()

    if (messageContent && stompClient) {
        const chatMessage = {
            from: user,
            message: messageContent,
            type: 'CHAT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        if (currentRecipient) {
            chatMessage.recipientTo = currentRecipient;
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            displayMessage(chatMessage, true);
            updateSidebarPreview(currentRecipient, "You: " + messageContent);
        } else {
            stompClient.send("/app/room-message", {}, JSON.stringify(chatMessage));
        }
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

const sendMessageChangeNickname = (prevNickname) => {
    const messageContent = `changed nickname to ${user}`;
    if (stompClient) {
        const chatMessage = { from: user, message: messageContent, type: 'CHANGE_NICKNAME' }
        stompClient.send("/app/room-message", {}, JSON.stringify(chatMessage))
    }
}

const onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);

    if (message.type === 'CHAT') {
        const snippet = `${message.from}: ${message.message}`;
        document.getElementById('global-last-msg').textContent = snippet;
    }

    if (currentRecipient) {
        if (message.type !== 'CONNECT' && message.type !== 'DISCONNECT' && message.type !== 'CHANGE_NICKNAME') {
            return;
        }
    }
    displayMessage(message, false);
}

const onPrivateMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);

    if (!activeChats.has(message.from)) {
        activeChats.set(message.from, message.message);
        addChatToSidebar(message.from);
    }
    updateSidebarPreview(message.from, message.message);

    if (currentRecipient === message.from) {
        displayMessage(message, true);
    } else {
        addNotification(createNotification(`New message from ${message.from}`, "success-notification"));
    }
}

function updateSidebarPreview(nickname, text) {
    activeChats.set(nickname, text);
    const previewEl = document.getElementById(`last-msg-${nickname}`);
    if (previewEl) previewEl.textContent = text;
}

const displayMessage = (message, isPrivate) => {
    const chat = document.getElementById('chat');

    if (message.type === 'CONNECT') {
        chat.innerHTML += `<div class="event-message">${message.from} joined the chat</div>`;
    } else if (message.type === 'DISCONNECT') {
        chat.innerHTML += `<div class="event-message">${message.from} left the chat</div>`;
    } else if (message.type === 'CHANGE_NICKNAME') {
        chat.innerHTML += `<div class="event-message">${message.from} ${message.message}</div>`;
    } else {
        const isMyMessage = message.from === user;
        const wrapper = document.createElement('div');
        wrapper.className = `chat-message-wrapper ${isMyMessage ? 'message-out' : 'message-in'}`;

        const timestamp = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let nameHtml = '';
        if (!isMyMessage) {
            nameHtml = `<span class="message-sender-name" style="color: ${getAvatarColor(message.from)}">${message.from}</span>`;
        }

        wrapper.innerHTML = `
            <div class="chat-bubble">
                ${nameHtml}
                <div class="message-text">${message.message}</div>
                <div class="message-meta">${timestamp}</div>
            </div>
        `;

        chat.appendChild(wrapper);
    }

    const chatBody = document.getElementById('chat-body');
    chatBody.scrollTop = chatBody.scrollHeight;
}

const getAvatarColor = (nickname) => {
    let hash = 0;
    if (!nickname) return '#3390ec';
    for (let i = 0; i < nickname.length; i++) {
        hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colours = ['#e66465', '#9198e5', '#3390ec', '#f3a683', '#546de5', '#e15f41', '#3dc1d3', '#f19066'];
    const index = Math.abs(hash % colours.length);
    return colours[index];
}

document.getElementById('nickname-form').addEventListener('submit', handleSetUserNickname);
document.getElementById('connect-form').addEventListener('submit', connect);
document.getElementById('disconnect-form').addEventListener('submit', disconnect);
document.getElementById('message-controls').addEventListener('submit', sendMessage);

const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
    tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
    tx[i].addEventListener("input", OnInput, false);
}
function OnInput() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
    if (this.scrollHeight > 150) {
        this.style.overflowY = "auto";
    } else {
        this.style.overflowY = "hidden";
    }
}

document.getElementById('message').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('message-controls').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
});