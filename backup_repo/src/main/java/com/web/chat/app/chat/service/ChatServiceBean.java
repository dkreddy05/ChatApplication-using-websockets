package com.web.chat.app.chat.service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import com.web.chat.app.chat.domain.Message;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class ChatServiceBean implements ChatService {
    private final SimpMessageSendingOperations messagingTemplate;
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();

    @Override
    public Set<String> getActiveUsers() {
        return activeUsers;
    }

    @Override
    public Message sendPublicMessage(Message message) {
        log.info("Message:{}", message);
        return message;
    }

    @Override
    public Message sendPrivateMessage(Message message) {
        return null;
    }

    @Override
    public Message newUser(Message message, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        String sender = message.getSender();
        simpMessageHeaderAccessor.getSessionAttributes().put("user", sender);
        activeUsers.add(sender);
        broadcastActiveUsers();
        log.info("Message:{}\n new User {}", message, sender);
        return message;
    }

    @Override
    public void removeUserAndBroadcast(String user) {
        if (user != null) {
            activeUsers.remove(user);
            broadcastActiveUsers();
        }
    }

    private void broadcastActiveUsers() {
        messagingTemplate.convertAndSend("/topic/active-users", activeUsers);
    }
}
