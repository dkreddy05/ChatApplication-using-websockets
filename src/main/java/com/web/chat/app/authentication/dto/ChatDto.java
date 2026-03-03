package com.web.chat.app.authentication.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.web.chat.app.authentication.chatuser.domain.ChatUserRole;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public class ChatDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String nickname;
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private ChatUserRole role;
    private Boolean locked = false;
    private Boolean enabled = false;

    public ChatDto() {
    }

    public ChatDto(String email, Boolean enabled, String firstName, String lastName, Boolean locked, String nickname,
            String password, ChatUserRole role) {
        this.email = email;
        this.enabled = enabled;
        this.firstName = firstName;
        this.lastName = lastName;
        this.locked = locked;
        this.nickname = nickname;
        this.role = role;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public String getFirstName() {
        return firstName;
    }

    public Long getId() {
        return id;
    }

    public String getLastName() {
        return lastName;
    }

    public Boolean getLocked() {
        return locked;
    }

    public String getNickname() {
        return nickname;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public ChatUserRole getRole() {
        return role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(ChatUserRole role) {
        this.role = role;
    }
}
