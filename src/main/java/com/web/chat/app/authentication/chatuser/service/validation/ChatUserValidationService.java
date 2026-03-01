package com.web.chat.app.authentication.chatuser.service.validation;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.dto.ChatDto;

public interface  ChatUserValidationService {
    void validate(ChatDto chatUser);
    
}       
