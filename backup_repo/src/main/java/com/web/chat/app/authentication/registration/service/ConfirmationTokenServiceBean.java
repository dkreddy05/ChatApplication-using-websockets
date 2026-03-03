package com.web.chat.app.authentication.registration.service;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.service.EnableService;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;
import com.web.chat.app.authentication.registration.repo.ConfirmationTokenRepo;
import com.web.chat.app.authentication.registration.service.validation.TokenValidationService;
import com.web.chat.app.authentication.util.exception.ConfirmationTokenNotFoundException;
@Service
public class ConfirmationTokenServiceBean implements ConfirmationTokenService{
    private final ConfirmationTokenRepo confirmationTokenRepo;
    private final TokenValidationService tokenValidationService;
    private final EnableService enableService;
    public ConfirmationTokenServiceBean(ConfirmationTokenRepo confirmationTokenRepo,TokenValidationService tokenValidationService,EnableService enableService){
        this.confirmationTokenRepo=confirmationTokenRepo;
        this.tokenValidationService=tokenValidationService;
        this.enableService=enableService;
    }
    @Override
    public void saveConfirmationToken(ConfirmationToken token) {
       confirmationTokenRepo.save(token);      
    }
    @Override
    public ConfirmationToken create(ChatUser chatUser) {
     return new ConfirmationToken(chatUser,
        LocalDateTime.now(),LocalDateTime.now().plusMinutes(60),UUID.randomUUID().toString()
     );
       
    }
    

  @Override
public ConfirmationToken getToken(String token) {
    return confirmationTokenRepo.findByToken(token)
            .orElseThrow(() ->
                    new ConfirmationTokenNotFoundException(
                            "Can't find confirmation token: " + token
                    )
            );
}

    @Override
    public String confirm(String token) {
        ConfirmationToken confirmationToken = getToken(token);
        tokenValidationService. validate(confirmationToken);
        confirmationToken.setConfirmedAt(LocalDateTime.now());
        confirmationTokenRepo.save(confirmationToken);
        return "confirmed";
    }
    
}
