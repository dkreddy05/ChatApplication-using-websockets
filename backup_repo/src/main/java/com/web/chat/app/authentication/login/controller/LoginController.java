package com.web.chat.app.authentication.login.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {

    @GetMapping("/login")
    
    public String login(){
        return "login";
    }
}