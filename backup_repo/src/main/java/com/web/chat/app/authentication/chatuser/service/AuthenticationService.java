package com.web.chat.app.authentication.chatuser.service;
import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.dto.ChatDto;

public interface  AuthenticationService {
    String signUp(ChatDto chatUser);
    
}
