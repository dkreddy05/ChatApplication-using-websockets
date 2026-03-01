package com.web.chat.app.authentication.registration.domain;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegistrationRequest {
@NotNull(message=" First Name Cannot be null")
@Size(min=2,max=32 ,message="Name must be between 2 and 32 characters")
 private String firstname;
@NotNull(message="Last name cannot be null")
@Size(min=2,max=32,message="Name must be between 2 and 32 characters")
 private String lastname;
@NotNull(message="Nickname cannnot be null")
@Size(min=2,max=32,message="Name must be between 2 and 32 characters")
    private String nickname;

    @NotNull(message="Mail cannnot be null")
    @Size(min=2,max=32,message="mail must be between 2 and 32 characters")
    private String mail;

    @NotNull(message="Password cannot be null")
    @Size(min=2,message="Mail must be between 2 and 32 characters")
    private String password;
public RegistrationRequest(){}
    public String getMail(){return this.mail;}
    public String getPassword(){return this.password;}



}
