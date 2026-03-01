package com.web.chat.app.authentication.util.exception;

public class ConfirmationTokenExpiredException extends RuntimeException {
public ConfirmationTokenExpiredException(String message){
    super(message);
}    
}
