package com.web.chat.app.authentication.util.exception;
import java.util.Date;
public record ExceptionDetails(Date timestamp,String message,String details) {
    
}
