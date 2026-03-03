package com.web.chat.app.authentication.chatuser.service.validation;
import com.web.chat.app.authentication.dto.ChatDto;
import org.springframework.stereotype.Service;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.repo.ChatUserRepo;
import com.web.chat.app.authentication.util.exception.NickNameChangeException;
@Service
public class NickNameValidationServiceBean implements NickNameValidationService{
private final ChatUserRepo chatUserRepo;
public NickNameValidationServiceBean(ChatUserRepo chatUserRepo){
    this.chatUserRepo=chatUserRepo;
}
@Override
public void validate(ChatDto chatUser, String nickname){
  validateNull(nickname, chatUser);
  validateEquality(chatUser.getNickname(), nickname);
  validateAvailability(nickname);
}
@Override
public void validateAvailability(String nickname){
    ChatUser user=chatUserRepo.findChatUserByNickname(nickname);
    if(user!=null){
        throw new NickNameChangeException("Nickname is already taken");
    }
}
private void validateNull(String nickname,ChatDto chatUser){
    if(chatUser==null || nickname==null || nickname.isEmpty()){
        throw new NickNameChangeException(" Nickname or user cannot be empty");
    }
}
private void validateEquality(String name,String nickname){
    if(name.equals(nickname)){
        throw new NickNameChangeException("This is already your nickname");
    }
}
    
}
