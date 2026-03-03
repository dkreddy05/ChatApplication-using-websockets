package com.web.chat.app.authentication.chatuser.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.web.chat.app.authentication.chatuser.service.AuthenticationService;
import com.web.chat.app.authentication.chatuser.service.ChatUserInfoService;
import com.web.chat.app.authentication.dto.ChatDto;

@RestController
@RequestMapping("/api/Users")
public class ChatUserController {
    private AuthenticationService authenticationService;
    private ChatUserInfoService chatUserInfoService;

    public ChatUserController(AuthenticationService authenticationService, ChatUserInfoService chatUserInfoService) {
        this.authenticationService = authenticationService;
        this.chatUserInfoService = chatUserInfoService;
    }

    @PostMapping("/signUp")
    public ResponseEntity<?> signup(@RequestBody ChatDto chatDto) {
        String response = authenticationService.signUp(chatDto);
        if (response == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("query") String query) {
        List<ChatDto> users = chatUserInfoService.searchUsersByNickname(query);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

}
