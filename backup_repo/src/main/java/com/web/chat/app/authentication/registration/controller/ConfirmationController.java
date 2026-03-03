package com.web.chat.app.authentication.registration.controller;


import com.web.chat.app.authentication.registration.service.RegistrationService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@AllArgsConstructor
@RequestMapping(path = "api/registration", produces = MediaType.APPLICATION_JSON_VALUE)
public class ConfirmationController {

    private final RegistrationService registrationService;

    @GetMapping(path = "/confirm")
    public String confirm(@RequestParam("token") String token) {
        return registrationService.confirmToken(token);
    }

}