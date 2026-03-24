package com.web.chat.app.authentication.dto;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.stream.Collectors;

@Service
public class Mapper {

    public ChatUser toEntity(ChatDto chatDto) {
        ChatUser user = new ChatUser();

        user.setFirstName(chatDto.getFirstName());
        user.setLastName(chatDto.getLastName());
        user.setNickname(chatDto.getNickname());
        user.setEmail(chatDto.getEmail());
        user.setPassword(chatDto.getPassword());
        user.setRole(chatDto.getRole());
        user.setEnabled(true);
        user.setLocked(false);
        user.setProfilePictureUrl(chatDto.getProfilePictureUrl());

        return user;
    }

    public ChatDto toDto(ChatUser chatUser) {
        ChatDto dto = new ChatDto(
                chatUser.getEmail(),
                chatUser.getEnabled(),
                chatUser.getFirstName(),
                chatUser.getLastName(),
                chatUser.getLocked(),
                chatUser.getNickname(),
                chatUser.getPassword(),
                chatUser.getRole());
        dto.setProfilePictureUrl(chatUser.getProfilePictureUrl());
        return dto;
    }

    public UserDetails toUserDetails(ChatUser chatUser) {
        return User.builder()
                .username(chatUser.getEmail())
                .password(chatUser.getPassword())
                .disabled(!chatUser.getEnabled())
                .accountLocked(chatUser.getLocked())
                .authorities(new SimpleGrantedAuthority(chatUser.getRole().name()))
                .build();
    }

    public ChatUser toChatUser(UserDetails userDetails) {

        ChatUser chatUser = new ChatUser();
        chatUser.setEmail(userDetails.getUsername());
        chatUser.setPassword(userDetails.getPassword());
        chatUser.setEnabled(userDetails.isEnabled());
        chatUser.setLocked(!userDetails.isAccountNonLocked());

        Collection<String> roles = userDetails.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return chatUser;
    }
}