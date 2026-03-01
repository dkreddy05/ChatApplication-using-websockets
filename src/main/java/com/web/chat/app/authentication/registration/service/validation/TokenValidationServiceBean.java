package com.web.chat.app.authentication.registration.service.validation;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import com.web.chat.app.authentication.util.exception.ConfirmationTokenExpiredException;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;

@Service
public class TokenValidationServiceBean implements TokenValidationService {

    @Override
    public void validate(ConfirmationToken token) {
        validateToken(token);
    }

    public void validateToken(ConfirmationToken token) {
        if (token.getConfirmedAt() != null || token.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new ConfirmationTokenExpiredException("Token is invalid or expired");
        }
    }
}