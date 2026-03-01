package com.web.chat.app.authentication.chatuser.service;

import org.springframework.stereotype.Service;

@Service
public class EnableServiceBean implements EnableService {

    @Override
    public void enable(String email) {
        // your logic to enable the user (e.g., set enabled flag true and save)
        System.out.println("Enabled user: " + email);
    }
}