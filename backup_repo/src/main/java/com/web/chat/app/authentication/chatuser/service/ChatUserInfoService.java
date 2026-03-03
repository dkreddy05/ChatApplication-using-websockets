package com.web.chat.app.authentication.chatuser.service;

import java.util.List;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.dto.ChatDto;

public interface ChatUserInfoService {
    ChatUser getUserDetails(String email);

    ChatUser getDetailsByNickname(String nickname);

    List<ChatDto> searchUsersByNickname(String query);
}
