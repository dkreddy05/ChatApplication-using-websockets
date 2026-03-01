package com.web.chat.app.authentication.registration.domain;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.web.chat.app.authentication.chatuser.domain.ChatUser;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ConfirmationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false)
    private String token;

    @Column(nullable = false)
    private LocalDateTime createddAt;

    @Column(nullable = false)
    private LocalDateTime expiredAt;

    @ManyToOne
    @JoinColumn(nullable = false, name = "chat_user_id")
    private ChatUser chatUser;

    @Column(nullable = true)
    private LocalDateTime confirmedAt;

    public ConfirmationToken(ChatUser chatUser, LocalDateTime createddAt, LocalDateTime expiredAt, String token) {
        this.chatUser = chatUser;
        this.createddAt = createddAt;
        this.expiredAt = expiredAt;
        this.token = token;
    }

    public String getToken() {
        return token;
    }
    public LocalDateTime getConfirmedAt(){
        return this.confirmedAt;
    }
    public LocalDateTime getExpiredAt(){
        return this.expiredAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
    public ChatUser getChatUser(){
        return this.chatUser;
    }
}