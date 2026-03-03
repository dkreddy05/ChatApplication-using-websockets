package com.web.chat.app.authentication.util.exception;
import java.util.Date;
public record  FieldExceptionDetails(Date timestamp,String message,String details,String field) {
    
}



