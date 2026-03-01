package com.web.chat.app.authentication.chatuser.service;

import java.util.List;
import java.util.stream.Collectors;
import com.web.chat.app.authentication.dto.ChatDto;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.web.chat.app.authentication.dto.Mapper;
import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.repo.ChatUserRepo;
import com.web.chat.app.authentication.chatuser.service.validation.ChatUserValidationService;
import com.web.chat.app.authentication.chatuser.service.validation.NickNameValidationService;
import com.web.chat.app.authentication.registration.domain.ConfirmationToken;
import com.web.chat.app.authentication.registration.service.ConfirmationTokenService;
import com.web.chat.app.authentication.util.exception.EmailAlreadyTakenException;
import jakarta.transaction.Transactional;

@Service
public class ChatUserServiceBean
    implements UserDetailsService, AuthenticationService, ChatUserInfoService, ChatUserUpdateService {
  private final ChatUserRepo chatuserrepo;
  private final static String USER_NOT_FOUND_MESSAGE = "User not found with parameter %s";
  private final BCryptPasswordEncoder bcrypt;
  private final ConfirmationTokenService confirmationToken;
  private final ChatUserValidationService chatUserValidationService;
  private final NickNameValidationService nickNameValidationService;
  private final Mapper mapper;

  public ChatUserServiceBean(ChatUserRepo chatuserrepo, BCryptPasswordEncoder bCryptPasswordEncoder,
      ConfirmationTokenService confirmationToken, ChatUserValidationService chatUserValidationService,
      NickNameValidationService nickNameValidationService, Mapper mapper) {
    this.bcrypt = bCryptPasswordEncoder;
    this.chatuserrepo = chatuserrepo;
    this.mapper = mapper;
    this.chatUserValidationService = chatUserValidationService;
    this.nickNameValidationService = nickNameValidationService;
    this.confirmationToken = confirmationToken;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    ChatUser user = chatuserrepo.findChatUserByEmail(email).orElse(null);
    if (user == null) {
      throw new UsernameNotFoundException(String.format(USER_NOT_FOUND_MESSAGE, email));
    }
    return mapper.toUserDetails(user);
  }

  @Override
  public ChatUser getUserDetails(String email) {
    ChatUser user = chatuserrepo.findChatUserByEmail(email).orElse(null);
    if (user == null) {
      throw new EmailAlreadyTakenException(USER_NOT_FOUND_MESSAGE);
    }
    return user;

  }

  @Override
  @Transactional
  public String signUp(ChatDto chatUser) {

    chatUserValidationService.validate(chatUser);
    nickNameValidationService.validateAvailability(chatUser.getNickname());
    // String password=bcrypt.encode(chatUser.getPassword());
    // chatUser.setPassword(password);
    System.out.println(chatUser.getPassword());
    ChatUser user = mapper.toEntity(chatUser);
    System.out.println(user.getPassword());
    chatuserrepo.save(user);
    ConfirmationToken Token = confirmationToken.create(user);
    confirmationToken.saveConfirmationToken(Token);
    return Token.getToken();
  }

  @Override
  public ChatUser getDetailsByNickname(String nickname) {
    ChatUser user = chatuserrepo.findChatUserByNickname(nickname);
    if (user == null) {
      throw new UsernameNotFoundException(String.format(USER_NOT_FOUND_MESSAGE, nickname));
    }
    return user;
  }

  @Transactional
  @Override
  public void updateChatUserNickname(String email, String nickname) {
    ChatUser chatUser = getUserDetails(email);
    ChatDto dto = mapper.toDto(chatUser);
    nickNameValidationService.validate(dto, nickname);
    chatUser.setNickname(nickname);
    chatuserrepo.save(chatUser);
  }

  @Override
  public List<ChatDto> searchUsersByNickname(String query) {
    List<ChatUser> users = chatuserrepo.findByNicknameContainingIgnoreCase(query);
    return users.stream()
        .map(mapper::toDto)
        .collect(Collectors.toList());
  }
}
