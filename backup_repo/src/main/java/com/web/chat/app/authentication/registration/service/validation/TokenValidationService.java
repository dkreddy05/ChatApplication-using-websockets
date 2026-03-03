package com.web.chat.app.authentication.registration.service.validation;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;
public interface TokenValidationService {
    void validate(ConfirmationToken token);
}
