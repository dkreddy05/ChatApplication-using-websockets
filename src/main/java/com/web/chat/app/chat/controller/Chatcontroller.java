package com.web.chat.app.chat.controller;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.web.chat.app.chat.domain.Message;
import com.web.chat.app.chat.service.ChatService;

@Controller
public class Chatcontroller {
    private final ChatService chatService;

    @Autowired
    public Chatcontroller(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/room-message")
    @SendTo("/topic/public")
    public Message sendMessage(@Payload Message message) {
        return chatService.sendPublicMessage(message);
    }

    @MessageMapping("/new-User")
    @SendTo("/topic/public")
    public Message newUser(@Payload final Message message,
            SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        return chatService.newUser(message, simpMessageHeaderAccessor);
    }

    @MessageMapping("/active-users")
    @SendTo("/topic/active-users")
    public Set<String> getActiveUsers() {
        return chatService.getActiveUsers();
    }

    @MessageMapping("/private-message")
    public void sendPrivateMessage(@Payload Message message) {
        chatService.sendPrivateMessage(message);
    }

    @MessageMapping("/message-status")
    public void updateMessageStatus(@Payload com.web.chat.app.chat.domain.MessageStatusUpdate update) {
        chatService.updateMessageStatus(update);
    }

    @GetMapping("/api/chat/history")
    @ResponseBody
    public ResponseEntity<List<Message>> getPrivateHistory(
            @RequestParam String user1,
            @RequestParam String user2) {
        List<Message> history = chatService.getPrivateHistory(user1, user2);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/api/chat/group/history")
    @ResponseBody
    public ResponseEntity<List<Message>> getGroupHistory(
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(defaultValue = "0") int page) {
        List<Message> history = chatService.loadHistory(pageSize);
        return ResponseEntity.ok(history);
    }
}
