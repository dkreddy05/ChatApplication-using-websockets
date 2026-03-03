package com.web.chat.app.authentication.security.config;

import com.web.chat.app.authentication.chatuser.service.ChatUserServiceBean;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class WebSecurityConfig {

    private final ChatUserServiceBean chatUserServiceBean;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            AuthenticationManagerBuilder auth) throws Exception {

        http
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/api/registration/**", "/register", "/").permitAll()
                .requestMatchers("/js/**", "/css/**", "/img/public/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .formLogin()
                .loginPage("/login").permitAll()
                .defaultSuccessUrl("/dashboard", true)
            .and()
            .logout().permitAll();

        auth.authenticationProvider(daoAuthenticationProvider());

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(chatUserServiceBean);
        provider.setPasswordEncoder(bCryptPasswordEncoder);
        return provider;
    }
}
