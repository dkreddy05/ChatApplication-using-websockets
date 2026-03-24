package com.web.chat.app.chat.domain;

import java.time.Instant;

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

    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.SENT;

    // Accept ISO-8601 timestamps including a trailing 'Z' (e.g. 2026-03-15T10:11:00.947Z)
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timeStamp;

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
            this.timeStamp = Instant.now();
        }
    }
}
