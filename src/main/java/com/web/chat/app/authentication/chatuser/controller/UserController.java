package com.web.chat.app.authentication.chatuser.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;
import com.web.chat.app.authentication.chatuser.service.ChatUserInfoService;
import com.web.chat.app.authentication.chatuser.service.ChatUserUpdateService;
import com.web.chat.app.authentication.dto.ChatDto;
import com.web.chat.app.authentication.dto.Mapper;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final ChatUserInfoService chatUserInfoService;
    private final ChatUserUpdateService chatUserUpdateService;
    private final Mapper mapper;

    public UserController(ChatUserInfoService chatUserInfoService, ChatUserUpdateService chatUserUpdateService,
            Mapper mapper) {
        this.chatUserInfoService = chatUserInfoService;
        this.chatUserUpdateService = chatUserUpdateService;
        this.mapper = mapper;
    }

    @GetMapping("/")
    public ResponseEntity<ChatDto> getUser(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        ChatUser user = chatUserInfoService.getUserDetails(principal.getName());
        return new ResponseEntity<>(mapper.toDto(user), HttpStatus.OK);
    }

    @PutMapping("/")
    public ResponseEntity<?> updateNickname(Principal principal, @RequestBody ChatDto chatDto) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        try {
            chatUserUpdateService.updateChatUserNickname(principal.getName(), chatDto.getNickname());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(Principal principal, @RequestBody ChatDto chatDto) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        try {
            chatUserUpdateService.updateChatUserProfilePicture(principal.getName(), chatDto.getProfilePictureUrl());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
