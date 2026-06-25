package com.example.attendance.service;

import com.example.attendance.dto.AuthRequest;
import com.example.attendance.dto.AuthResponse;
import com.example.attendance.dto.RegisterRequest;
import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceLoginTest {
    @Test
    void loginUsesStoredCredentialsAndReturnsRealToken() {
        UserRepository users = mock(UserRepository.class);
        JwtService jwt = mock(JwtService.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        AuthService service = new AuthService(users, encoder, jwt);
        User user = new User();
        user.setUsername("faculty");
        user.setPassword(encoder.encode("password123"));
        user.setRole("FACULTY");
        when(users.findByUsername("faculty")).thenReturn(Optional.of(user));
        when(jwt.generateToken("faculty", "FACULTY")).thenReturn("signed-token");
        AuthRequest request = new AuthRequest();
        request.setUsername("faculty");
        request.setPassword("password123");

        AuthResponse response = service.login(request);

        assertEquals("signed-token", response.getToken());
        assertEquals("FACULTY", response.getRole());
    }

    @Test
    void publicRegistrationAlwaysCreatesFaculty() {
        UserRepository users = mock(UserRepository.class);
        JwtService jwt = mock(JwtService.class);
        AuthService service = new AuthService(users, new BCryptPasswordEncoder(), jwt);
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwt.generateToken("new-user", "FACULTY")).thenReturn("signed-token");
        RegisterRequest request = new RegisterRequest();
        request.setUsername("new-user");
        request.setPassword("password123");
        request.setEmail("new@example.com");
        request.setFullName("New User");

        AuthResponse response = service.register(request);

        assertEquals("FACULTY", response.getRole());
        verify(jwt).generateToken("new-user", "FACULTY");
    }

    @Test
    void registerRejectsDuplicateUsername() {
        UserRepository users = mock(UserRepository.class);
        JwtService jwt = mock(JwtService.class);
        AuthService service = new AuthService(users, new BCryptPasswordEncoder(), jwt);
        when(users.existsByUsername("duplicate")).thenReturn(true);
        RegisterRequest request = new RegisterRequest();
        request.setUsername("duplicate");
        request.setPassword("password123");
        request.setEmail("dup@example.com");
        request.setFullName("Duplicate User");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.register(request));

        assertEquals("Username already exists", exception.getReason());
        verify(users).existsByUsername("duplicate");
        verify(users, never()).save(any(User.class));
        verify(jwt, never()).generateToken(anyString(), anyString());
    }

    @Test
    void loginRejectsWrongPassword() {
        UserRepository users = mock(UserRepository.class);
        JwtService jwt = mock(JwtService.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        AuthService service = new AuthService(users, encoder, jwt);
        User user = new User();
        user.setUsername("faculty");
        user.setPassword(encoder.encode("password123"));
        user.setRole("FACULTY");
        when(users.findByUsername("faculty")).thenReturn(Optional.of(user));
        AuthRequest request = new AuthRequest();
        request.setUsername("faculty");
        request.setPassword("wrong-password");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> service.login(request));

        assertEquals("Invalid credentials", exception.getReason());
        verify(jwt, never()).generateToken(anyString(), anyString());
    }
}
