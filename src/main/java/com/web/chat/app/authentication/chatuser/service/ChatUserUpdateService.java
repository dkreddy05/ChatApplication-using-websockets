package com.web.chat.app.authentication.chatuser.service;

public interface ChatUserUpdateService {
    void updateChatUserNickname(String email, String nickname);

    void updateChatUserProfilePicture(String email, String profilePictureUrl);
}
