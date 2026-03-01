package com.web.chat.app.authentication.util.exception;

public class EmailAlreadyConfirmedException extends RuntimeException{
    public EmailAlreadyConfirmedException(String message){
        super(message);
    }
}
