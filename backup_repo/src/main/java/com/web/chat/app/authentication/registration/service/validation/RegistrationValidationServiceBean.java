package com.web.chat.app.authentication.registration.service.validation;
import org.springframework.stereotype.Service;

import com.web.chat.app.authentication.registration.domain.RegistrationRequest;
@Service

public class RegistrationValidationServiceBean implements RegistrationValidationService{
    @Override
    public void validate(RegistrationRequest  request){
        validateRequest(request.getMail());
        validatePassword(request.getPassword());

    }
    public void validateRequest(String email){

    }       
    public void validatePassword(String pass){
        
    }

}
