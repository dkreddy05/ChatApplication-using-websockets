package com.web.chat.app.authentication.chatuser.service.validation;
import com.web.chat.app.authentication.dto.ChatDto;
import org.springframework.stereotype.Service;
import com.web.chat.app.authentication.dto.Mapper;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.repo.ChatUserRepo;

@Service
public class ChatUserValidationServiceBean implements ChatUserValidationService{
    private final ChatUserRepo chatUserRepo;
    private final Mapper mapper;
    public ChatUserValidationServiceBean(ChatUserRepo chatUserRepo, Mapper mapper){
        this.chatUserRepo=chatUserRepo;
        this.mapper=mapper;
    }
    @Override
    public void validate(ChatDto chatUser){
        ChatUser user=mapper.toEntity(chatUser);
        validateNull(user);
        validateAvailability(user.getEmail());

    }
    private void validateNull(ChatUser chatUser){
        if(chatUser==null){
            throw new RuntimeException("User cannot be nulled");
        }
    }
    private void validateAvailability(String mail){
        ChatUser user=chatUserRepo.findChatUserByEmail(mail).orElse(null);
        if(user!=null && user.isEnabled()){
            throw new RuntimeException("User with email"+mail+"already exists");
        }

        

    }
     
    
}
