package com.web.chat.app.chat.domain;

public enum MessageType {
    SENT, RECEIVED, JOIN, LEAVE, DELIVERED, READ, DISCONNECT, CONNECT,
    CHAT, CHANGE_NICKNAME, PRIVATE,
    IMAGE, VIDEO, FILE, IS_TYPING, STOP_TYPING
}
