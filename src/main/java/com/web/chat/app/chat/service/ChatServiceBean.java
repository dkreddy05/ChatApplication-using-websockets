package com.web.chat.app.chat.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.service.ChatUserInfoService;
import com.web.chat.app.chat.domain.Message;
import com.web.chat.app.chat.domain.MessageType;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class ChatServiceBean implements ChatService {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageRepository messageRepository;
    private final ChatUserInfoService chatUserInfoService;

    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();

    @Override
    public Set<String> getActiveUsers() {
        return activeUsers;
    }

    @Override
    public Message sendPublicMessage(Message message) {
        log.info("Public message from {}: {}", message.getSender(), message.getContent());
        message.setType(MessageType.CHAT);
        messageRepository.save(message);
        return message;
    }

    @Override
    public Message sendPrivateMessage(Message message) {
        if (message.getSender() == null || message.getRecipientTo() == null) {
            log.warn("sendPrivateMessage: sender or recipient is null — dropping message");
            return message;
        }
        message.setType(MessageType.PRIVATE);
        Message saved = messageRepository.save(message);
        log.info("Private message saved (id={}): {} -> {}",
                saved.getId(), saved.getSender(), saved.getRecipientTo());
        ChatUser recipient = chatUserInfoService.getDetailsByNickname(saved.getRecipientTo());
        if (recipient == null) {
            log.warn("sendPrivateMessage: recipient nickname '{}' not found — saved but not delivered live",
                    saved.getRecipientTo());
            return saved;
        }

        ChatUser sender = chatUserInfoService.getDetailsByNickname(saved.getSender());
        messagingTemplate.convertAndSendToUser(recipient.getEmail(), "/queue/private", saved);
        log.debug("Delivered private message to recipient '{}'", recipient.getEmail());
        if (sender != null && !sender.getEmail().equals(recipient.getEmail())) {
            messagingTemplate.convertAndSendToUser(sender.getEmail(), "/queue/private", saved);
            log.debug("Echoed private message back to sender '{}'", sender.getEmail());
        }
        return saved;
    }

    @Override
    public List<Message> getPrivateHistory(String user1, String user2) {
        log.debug("Fetching private history between '{}' and '{}'", user1, user2);
        return messageRepository.findPrivateConversation(user1, user2);
    }

    @Override
    public Message newUser(Message message, SimpMessageHeaderAccessor simpMessageHeaderAccessor) {
        String sender = message.getSender();
        if (sender == null || sender.isBlank()) {
            log.warn("newUser called with null/empty sender — ignoring. Message: {}", message);
            return message;
        }
        simpMessageHeaderAccessor.getSessionAttributes().put("user", sender);
        activeUsers.add(sender);
        broadcastActiveUsers();
        log.info("New user joined: {}", sender);
        return message;
    }

    @Override
    public void removeUserAndBroadcast(String user) {
        if (user != null) {
            activeUsers.remove(user);
            broadcastActiveUsers();
            log.info("User disconnected: {}", user);
        }
    }

    private void broadcastActiveUsers() {
        messagingTemplate.convertAndSend("/topic/active-users", activeUsers);
    }

    @Override
    public List<Message> loadHistory(int pageSize) {
        Pageable pageable = PageRequest.of(0, pageSize);
        Slice<Message> slice = messageRepository.findAllByOrderByTimeStampDesc(pageable);
        List<Message> history = new ArrayList<>(slice.getContent());
        Collections.reverse(history);
        return history;
    }

    @Override
    public void updateMessageStatus(com.web.chat.app.chat.domain.MessageStatusUpdate update) {
        messageRepository.findById(update.getId()).ifPresent(message -> {
            message.setStatus(update.getStatus());
            messageRepository.save(message);
            ChatUser originalSender = chatUserInfoService.getDetailsByNickname(message.getSender());
            if (originalSender != null) {
                messagingTemplate.convertAndSendToUser(
                        originalSender.getEmail(),
                        "/queue/status-updates",
                        update);
                log.debug("Pushed status update {} for msg {} to {}", update.getStatus(), message.getId(),
                        message.getSender());
            }
        });
    }

    @Override
    public void isTyping(com.web.chat.app.chat.domain.TypingStatus typingStatus) {
        messagingTemplate.convertAndSend("/topic/public", typingStatus);
    }
}
