package com.web.chat.app.authentication.security.config;

import com.web.chat.app.authentication.chatuser.service.ChatUserServiceBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig implements WebMvcConfigurer {

    private final ChatUserServiceBean chatUserServiceBean;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    // Explicit constructor — @AllArgsConstructor conflicts with @Value field
    // injection
    public WebSecurityConfig(ChatUserServiceBean chatUserServiceBean,
            BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.chatUserServiceBean = chatUserServiceBean;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            AuthenticationManagerBuilder auth) throws Exception {

        http
                .csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers("/api/registration/**", "/register", "/").permitAll()
                .requestMatchers("/js/**", "/css/**", "/img/public/**").permitAll()
                // Allow SockJS WebSocket handshake and polling paths
                .requestMatchers("/chat/**", "/ws/**").permitAll()
                // Allow serving uploaded media files without login
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .loginPage("/login").permitAll()
                .defaultSuccessUrl("/dashboard", true)
                .and()
                .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll();

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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files at /uploads/** from the configured upload directory
        String location = "file:" + uploadDir.replace("\\", "/");
        if (!location.endsWith("/"))
            location += "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
