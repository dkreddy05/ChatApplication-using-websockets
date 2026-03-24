package com.web.chat.app.authentication.security.filter;

import java.io.IOException;
import java.util.Objects;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.web.context.SecurityContextRepository;

public class JsonUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final ObjectMapper objectMapper;
    private static final RequestMatcher LOGIN_REQUEST_MATCHER = new OrRequestMatcher(
            new AntPathRequestMatcher("/login", "POST"),
            new AntPathRequestMatcher("/api/auth/login", "POST"));

    public JsonUsernamePasswordAuthenticationFilter(AuthenticationManager authenticationManager,
            ObjectMapper objectMapper, SecurityContextRepository securityContextRepository) {
        this.objectMapper = objectMapper;
        setAuthenticationManager(authenticationManager);
        setRequiresAuthenticationRequestMatcher(LOGIN_REQUEST_MATCHER);
        setSecurityContextRepository(securityContextRepository);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            LoginPayload payload;
            try {
                payload = objectMapper.readValue(request.getInputStream(), LoginPayload.class);
            } catch (IOException e) {
                throw new AuthenticationServiceException("Invalid login payload", e);
            }

            String username = Objects.toString(payload.getUsername(), "").trim();
            String password = Objects.toString(payload.getPassword(), "");
            
            System.out.println("Login attempt received in Filter for email: " + username);
            
            UsernamePasswordAuthenticationToken authRequest = new UsernamePasswordAuthenticationToken(username,
                    password);
            setDetails(request, authRequest);
            return this.getAuthenticationManager().authenticate(authRequest);
        }
        return super.attemptAuthentication(request, response);
    }

    @Override
    protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        return super.requiresAuthentication(request, response);
    }

    public static class LoginPayload {
        private String username;
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
