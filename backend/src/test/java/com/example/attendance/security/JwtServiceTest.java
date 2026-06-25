package com.example.attendance.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    @Test
    void generatedTokenContainsUsernameAndRole() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "a-secure-test-secret-that-is-32-bytes-long");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        String token = jwtService.generateToken("admin", "ADMIN");

        assertEquals("admin", jwtService.extractUsername(token));
        assertEquals("ADMIN", jwtService.extractRole(token));
    }

    @Test
    void shortConfiguredSecretIsRejected() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "too-short");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> jwtService.generateToken("admin", "ADMIN"));
        assertEquals("JWT_SECRET must contain at least 32 bytes", exception.getMessage());
    }

    @Test
    void tokenValidationHonorsUserMatchAndExpiration() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "a-secure-test-secret-that-is-32-bytes-long");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);

        String token = jwtService.generateToken("admin", "ADMIN");

        assertTrue(jwtService.isTokenValid(token, "admin"));
        assertFalse(jwtService.isTokenValid(token, "other"));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "a-secure-test-secret-that-is-32-bytes-long");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);

        String token = jwtService.generateToken("admin", "ADMIN");

        assertFalse(jwtService.isTokenValid(token, "admin"));
    }
}
