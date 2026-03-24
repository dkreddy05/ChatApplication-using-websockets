package com.web.chat.app.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping({"/", "/login", "/register", "/dashboard", "/confirm"})
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
