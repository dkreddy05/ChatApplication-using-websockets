package com.web.chat.app.chat.service;

import java.util.Set;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import com.web.chat.app.chat.domain.Message;

public interface ChatService {

    Message sendPublicMessage(Message message);

    Message sendPrivateMessage(Message message);

    Message newUser(Message message, SimpMessageHeaderAccessor headerAccessor);

    void removeUserAndBroadcast(String user);

    Set<String> getActiveUsers();
}