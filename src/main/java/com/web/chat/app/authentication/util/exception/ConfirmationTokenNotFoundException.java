package com.web.chat.app.authentication.util.exception;

public class ConfirmationTokenNotFoundException extends RuntimeException{
    public ConfirmationTokenNotFoundException(String message){
        super(message);
    }
    
}
