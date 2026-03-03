package com.web.chat.app.chat.domain;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timeStamp;

    @Column(columnDefinition = "TEXT")
    @JsonAlias("message")
    private String content;

    @JsonAlias("from")
    private String sender;

    private String recipientTo;

    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;

    @PrePersist
    public void prePersist() {
        if (this.timeStamp == null) {
            this.timeStamp = LocalDateTime.now();
        }
    }
}
