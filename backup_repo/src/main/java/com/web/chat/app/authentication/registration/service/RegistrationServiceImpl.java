package com.web.chat.app.authentication.registration.service;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.repo.ChatUserRepo;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;
import com.web.chat.app.authentication.registration.service.ConfirmationTokenService;
import com.web.chat.app.authentication.util.exception.ConfirmationTokenNotFoundException;
import com.web.chat.app.authentication.email.EmailSender;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.web.chat.app.authentication.registration.domain.RegistrationRequest;
import com.web.chat.app.authentication.registration.repo.ConfirmationTokenRepo;
import com.web.chat.app.authentication.chatuser.domain.ChatUserRole;
import com.web.chat.app.authentication.chatuser.service.AuthenticationService;
import com.web.chat.app.authentication.dto.ChatDto;
import com.web.chat.app.authentication.dto.Mapper;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.Builder;
@Builder

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final ChatUserRepo userRepository;
    private final ConfirmationTokenService tokenService;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder; 
    private final AuthenticationService authenticationService;
    private final Mapper mapper;

    @Override
    @Transactional
    public String create(RegistrationRequest request) {

    
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        System.out.println(encodedPassword+"In RegistrationServiceImpl");
        ChatDto dto=new ChatDto(request.getMail(), true, request.getFirstname(),request.getLastname(), false,request.getNickname(), encodedPassword,ChatUserRole.USER);
  String token = authenticationService.signUp(dto);
        // String link = "http://localhost:8080/confirm?token=" + token;
        // emailSender.send(
        //         request.getMail(),
        //         buildEmail(request.getNickname(), link)
        // );
         return token;
    }

    @Override
    @Transactional
    public String confirmToken(String token) {

        ConfirmationToken confirmation = tokenService.getToken(token);

        if (confirmation == null) {
            throw new ConfirmationTokenNotFoundException("Token not found: " + token);
        }

        if (confirmation.getConfirmedAt() != null) {
            throw new IllegalStateException("Token already confirmed");
        }

        tokenService.confirm(token);

        ChatUser user = confirmation.getChatUser();
        user.setEnabled(true);
        userRepository.save(user);

        return "Confirmed Successfully";
    }

    private String buildEmail(String name, String link) {
        return "<div>Hello " + name + ", click <a href=\"" + link + "\">here</a> to confirm</div>";
    }
}