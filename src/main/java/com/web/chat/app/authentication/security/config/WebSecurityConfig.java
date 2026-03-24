package com.web.chat.app.authentication.security.config;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.chat.app.authentication.chatuser.service.ChatUserServiceBean;
import com.web.chat.app.authentication.security.filter.JsonUsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig implements WebMvcConfigurer {

    private final ChatUserServiceBean chatUserServiceBean;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public WebSecurityConfig(
            ChatUserServiceBean chatUserServiceBean,
            BCryptPasswordEncoder bCryptPasswordEncoder,
            ObjectMapper objectMapper) {

        this.chatUserServiceBean = chatUserServiceBean;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.objectMapper = objectMapper;
    }

    // AuthenticationManager bean (Spring Security 6 way)
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    // Security Filter Chain
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            AuthenticationManager authenticationManager) throws Exception {

        SecurityContextRepository repo = securityContextRepository();

        JsonUsernamePasswordAuthenticationFilter jsonFilter = new JsonUsernamePasswordAuthenticationFilter(
                authenticationManager, objectMapper, repo);

        jsonFilter.setAuthenticationSuccessHandler(successHandler());
        jsonFilter.setAuthenticationFailureHandler(failureHandler());

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .securityContext(sc -> sc
                        .securityContextRepository(repo)
                        .requireExplicitSave(false))
                .authenticationProvider(daoAuthenticationProvider())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/index.html", "/login", "/register", "/dashboard").permitAll()
                        .requestMatchers("/assets/**", "/vite.svg").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/registration/**").permitAll()
                        .requestMatchers("/api/chat/**").permitAll()
                        // WebSocket/SockJS handshake + transports must bypass security
                        .requestMatchers(
                                "/chat/**",
                                "/ws/**",
                                "/topic/**",
                                "/app/**")
                        .permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(this::handleUnauthorized)
                        .accessDeniedHandler(this::handleAccessDenied))
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(
                                (request, response, authentication) -> response.setStatus(HttpServletResponse.SC_OK))
                        .deleteCookies("JSESSIONID")
                        .permitAll())
                .addFilterAt(jsonFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // DAO Authentication Provider
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(chatUserServiceBean);
        provider.setPasswordEncoder(bCryptPasswordEncoder);
        return provider;
    }

    // Login Success Handler
    private AuthenticationSuccessHandler successHandler() {
        return (request, response, authentication) -> {
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            objectMapper.writeValue(
                    response.getWriter(),
                    Map.of(
                            "status", "SUCCESS",
                            "username", authentication.getName()));
        };
    }

    // Login Failure Handler
    private AuthenticationFailureHandler failureHandler() {
        return (request, response, exception) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            objectMapper.writeValue(
                    response.getWriter(),
                    Map.of(
                            "status", "FAILURE",
                            "message", exception.getMessage()));
        };
    }

    // Unauthorized Handler (401 - not logged in)
    private void handleUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        if (response.isCommitted()) return;
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        objectMapper.writeValue(
                response.getWriter(),
                Map.of(
                        "status", "UNAUTHORIZED",
                        "message", "Authentication required"));
    }

    // Access Denied Handler (403 - logged in but not permitted)
    private void handleAccessDenied(
            HttpServletRequest request,
            HttpServletResponse response,
            org.springframework.security.access.AccessDeniedException exception) throws IOException {

        if (response.isCommitted()) return;
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        objectMapper.writeValue(
                response.getWriter(),
                Map.of(
                        "status", "FORBIDDEN",
                        "message", "Access denied"));
    }

    // Serve uploaded files
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String location = "file:" + uploadDir.replace("\\", "/");

        if (!location.endsWith("/")) {
            location += "/";
        }

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
