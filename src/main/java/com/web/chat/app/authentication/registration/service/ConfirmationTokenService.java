package com.web.chat.app.authentication.registration.service;
import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;
public interface  ConfirmationTokenService {
    void saveConfirmationToken(ConfirmationToken token);
    ConfirmationToken create(ChatUser chatUser);
    ConfirmationToken getToken(String token);
    String confirm(String token);
}
