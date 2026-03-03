package com.web.chat.app.authentication.chatuser.service;
import org.springframework.stereotype.Service;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.repo.ChatUserRepo;
@Service
public class ChatUserConfirmationTokenEnabled{
    private final ChatUserRepo chatUserRepo;
    public ChatUserConfirmationTokenEnabled(ChatUserRepo chatUserRepo){
        this.chatUserRepo=chatUserRepo;
    }
    public void enable(String email){
ChatUser chatUser=chatUserRepo.findChatUserByEmail(email).
orElseThrow(() -> new IllegalStateException("User with email "+email+" not found"));
chatUser.setEnabled(true);
chatUserRepo.save(chatUser);
    }
}