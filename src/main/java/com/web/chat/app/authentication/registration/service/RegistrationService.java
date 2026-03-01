package com.web.chat.app.authentication.registration.service;
import com.web.chat.app.authentication.registration.domain.RegistrationRequest;

public interface RegistrationService {
    String create(RegistrationRequest request);
    String confirmToken(String token);
    
}
