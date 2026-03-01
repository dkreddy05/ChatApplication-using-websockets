package com.web.chat.app.authentication.util.exception;
public class EmailAlreadyTakenException extends RuntimeException{
    public EmailAlreadyTakenException(String message){
        super(message);
    }
    
}
