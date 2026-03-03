package com.web.chat.app.chat.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import com.web.chat.app.chat.service.ChatService;
import com.web.chat.app.chat.domain.Message;
import com.web.chat.app.authentication.chatuser.service.ChatUserInfoService;
import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Set;

@Controller
public class Chatcontroller {
    private final ChatService chatService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ChatUserInfoService chatUserInfoService;

    @Autowired
    public Chatcontroller(ChatService chatService, SimpMessagingTemplate simpMessagingTemplate,
            ChatUserInfoService chatUserInfoService) {
        this.chatService = chatService;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.chatUserInfoService = chatUserInfoService;
    }

    @GetMapping("/dashboard")
    public String getDashBoard() {
        return "dashboard";
    }

    @MessageMapping("/room-message")
    @SendTo("/topic/public")
    public Message sendMessage(@Payload Message message) {
        return chatService.sendPublicMessage(message);
    }

    @MessageMapping("/new-User")
    @SendTo("/topic/public")
    public Message newUser(@Payload final Message message, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        return chatService.newUser(message, simpMessageHeaderAccessor);
    }

    @MessageMapping("/active-users")
    @SendTo("/topic/active-users")
    public Set<String> getActiveUsers() {
        return chatService.getActiveUsers();
    }

    @MessageMapping("/private-message")
    public Message sendPrivateMessage(@Payload Message message) {
        ChatUser recipient = chatUserInfoService.getDetailsByNickname(message.getRecipientTo());
        if (recipient != null) {
            simpMessagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/private", message);
        }
        return message;
    }
}
