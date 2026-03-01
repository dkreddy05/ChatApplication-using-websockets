package com.web.chat.app.authentication.chatuser.service.validation;
import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.dto.ChatDto;

public interface  NickNameValidationService {
 void validate(ChatDto chatUser, String nickname);
 void validateAvailability(String nickname);   
}
