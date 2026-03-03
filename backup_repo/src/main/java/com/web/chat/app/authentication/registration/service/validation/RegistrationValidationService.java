package com.web.chat.app.authentication.registration.service.validation;

import com.web.chat.app.authentication.registration.domain.RegistrationRequest;

public interface RegistrationValidationService {
    void validate(RegistrationRequest request);
}