package com.web.chat.app.chat.domain;

public class TypingStatus {
    private String sender;
    private boolean isTyping;
    private String chatId;
    private MessageType type;

    public TypingStatus(String sender, boolean isTyping, String chatId, MessageType type) {
        this.sender = sender;
        this.isTyping = isTyping;
        this.chatId = chatId;
        this.type = type;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public boolean isTyping() {
        return isTyping;
    }

    public void setTyping(boolean typing) {
        isTyping = typing;
    }

}
