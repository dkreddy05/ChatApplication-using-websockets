package com.web.chat.app.authentication.email;

public interface EmailSender {

   String FROM_EMAIL ="dkreddy005@gmail.com";
   String SUBJECT = "Confirm your email";
   String LINK = "http://localhost:8080/api/registration/confirm?token=";

   void send(String to, String email);

   String build(String name, String link);

}