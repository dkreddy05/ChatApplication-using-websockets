package com.web.chat.app.chat.service;

import java.util.List;
import java.util.Set;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import com.web.chat.app.chat.domain.Message;

public interface ChatService {

    Message sendPublicMessage(Message message);

    Message sendPrivateMessage(Message message);

    Message newUser(Message message, SimpMessageHeaderAccessor headerAccessor);

    void removeUserAndBroadcast(String user);

    Set<String> getActiveUsers();

    List<Message> getPrivateHistory(String user1, String user2);

    List<Message> loadHistory(int pageSize);

    void updateMessageStatus(com.web.chat.app.chat.domain.MessageStatusUpdate update);

    void isTyping(com.web.chat.app.chat.domain.TypingStatus typingStatus);
}
