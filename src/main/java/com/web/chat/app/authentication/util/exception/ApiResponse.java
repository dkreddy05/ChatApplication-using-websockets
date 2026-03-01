package com.web.chat.app.authentication.util.exception;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
@Data
@AllArgsConstructor

public class ApiResponse<T> {
    private Date timestamp;
    private int status;
    private String message;
    private T data;
    public ApiResponse(int status, String message, T data) {
        this.timestamp = new Date();
        this.status = status;
        this.message = message;
        this.data = data;
    }

}
