package com.web.chat.app.authentication.email;
import java.util.Properties;
import jakarta.mail.Authenticator;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
@Component
public class EmailProperties {
   @Value("${email.username}")
   private String username;
   @Value("${email.password}")
   private String password;
   public Session set(){
       Properties prop=new Properties();
       prop.put("mail.smtp.port","2525");
       prop.put("mail.smtp.auth","true");
       prop.put("mail.smtp.host","mail.admin.tools");
       prop.put("mail.smtp.starttls.enable", "true");
       return Session.getInstance(prop,new Authenticator(){
           @Override
           protected PasswordAuthentication getPasswordAuthentication() {
               return new PasswordAuthentication(username, password);
           }
       });
   }
}