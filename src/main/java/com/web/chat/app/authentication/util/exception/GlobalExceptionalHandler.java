package com.web.chat.app.authentication.util.exception;

import java.util.Date;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

@ControllerAdvice
public class GlobalExceptionalHandler {
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<?> handleArgumentNotValidException(MethodArgumentNotValidException ex, WebRequest x) {
                String message = ex.getBindingResult()
                                .getFieldError()
                                .getDefaultMessage();
                String field = ex.getBindingResult()
                                .getFieldError()
                                .getField();
                FieldExceptionDetails details = new FieldExceptionDetails(new Date(), message, x.getDescription(false),
                                field);
                return new ResponseEntity<>(details, new HttpHeaders(), HttpStatus.BAD_REQUEST);

        }

        @ExceptionHandler(EmailAlreadyTakenException.class)
        public ResponseEntity<?> handleEmailAlreadyTakenException(EmailAlreadyTakenException ex, WebRequest x) {
                System.err.println(x);
                String field = "Email";
                FieldExceptionDetails details = new FieldExceptionDetails(new Date(), ex.getMessage(),
                                x.getDescription(false),
                                field);
                return new ResponseEntity<>(details, new HttpHeaders(), HttpStatus.CONFLICT);
        }

        @ExceptionHandler(ConfirmationTokenNotFoundException.class)
        public ResponseEntity<?> handleConfirmationTokenNotFound(ConfirmationTokenNotFoundException ex, WebRequest x) {
                String f = "Token is not found";
                FieldExceptionDetails details = new FieldExceptionDetails(new Date(), ex.getMessage(),
                                x.getDescription(false),
                                f);
                return new ResponseEntity<>(details, new HttpHeaders(), HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(EmailSendFailException.class)
        public ResponseEntity<?> handleEmailSendFailException(EmailSendFailException ex, WebRequest x) {
                FieldExceptionDetails details = new FieldExceptionDetails(new Date(), ex.getMessage(),
                                x.getDescription(false),
                                "Email cannot Send");
                return new ResponseEntity<>(details, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(NickNameChangeException.class)
        protected ResponseEntity<?> handleNicknameChangeException(NickNameChangeException ex, WebRequest request) {

                String field = "nickname";
                FieldExceptionDetails errorDetails = new FieldExceptionDetails(new Date(), ex.getMessage(),
                                request.getDescription(false), field);
                return new ResponseEntity<>(errorDetails, new HttpHeaders(), HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ChatUserValidationException.class)
        protected ResponseEntity<?> handleChatUserValidationException(ChatUserValidationException ex,
                        WebRequest request) {
                ExceptionDetails errorDetails = new ExceptionDetails(new Date(), ex.getMessage(),
                                request.getDescription(false));
                return new ResponseEntity<>(errorDetails, new HttpHeaders(), HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ConfirmationTokenExpiredException.class)
        protected ResponseEntity<?> handleConfirmationTokenExpiredException(ConfirmationTokenExpiredException ex,
                        WebRequest request) {
                ExceptionDetails errorDetails = new ExceptionDetails(new Date(), ex.getMessage(),
                                request.getDescription(false));
                return new ResponseEntity<>(errorDetails, new HttpHeaders(), HttpStatus.REQUEST_TIMEOUT);
        }

        @ExceptionHandler(EmailAlreadyConfirmedException.class)
        protected ResponseEntity<?> handleEmailAlreadyConfirmedException(EmailAlreadyConfirmedException ex,
                        WebRequest request) {
                ExceptionDetails errorDetails = new ExceptionDetails(new Date(), ex.getMessage(),
                                request.getDescription(false));
                return new ResponseEntity<>(errorDetails, new HttpHeaders(), HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<MyGlobalExceptionHandler> globalExceptionHandler(Exception ex) {
                return new ResponseEntity<>(new MyGlobalExceptionHandler(ex.getMessage()), new HttpHeaders(),
                                HttpStatus.INTERNAL_SERVER_ERROR);
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<?> handleRuntime(
                        RuntimeException ex) {

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal Error");
        }

        @Data
        @AllArgsConstructor
        private static class MyGlobalExceptionHandler {
                private String message;
        }

}
