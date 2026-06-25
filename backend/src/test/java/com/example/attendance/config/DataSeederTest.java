package com.example.attendance.config;

import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class DataSeederTest {

    @Test
    void run_updatesExistingAdminUserWithConfiguredPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        DataSeeder seeder = new DataSeeder(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(seeder, "adminUsername", "admin");
        ReflectionTestUtils.setField(seeder, "adminPassword", "admin123");
        ReflectionTestUtils.setField(seeder, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(seeder, "adminFullName", "System Administrator");

        User existingUser = new User();
        existingUser.setUsername("admin");
        existingUser.setPassword("old-password");
        existingUser.setEmail("old@example.com");
        existingUser.setFullName("Old Name");
        existingUser.setRole("FACULTY");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("admin123")).thenReturn("encoded-password");

        seeder.run();

        assertEquals("encoded-password", existingUser.getPassword());
        assertEquals("ADMIN", existingUser.getRole());
        assertEquals("admin@example.com", existingUser.getEmail());
        assertEquals("System Administrator", existingUser.getFullName());
        verify(userRepository).save(existingUser);
    }

    @Test
    void run_createsNewAdminUserWhenAccountDoesNotExist() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        DataSeeder seeder = new DataSeeder(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(seeder, "adminUsername", "admin");
        ReflectionTestUtils.setField(seeder, "adminPassword", "admin123");
        ReflectionTestUtils.setField(seeder, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(seeder, "adminFullName", "System Administrator");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        seeder.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertEquals("admin", savedUser.getUsername());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals("ADMIN", savedUser.getRole());
    }

    @Test
    void run_usesDefaultPasswordWhenConfiguredPasswordIsMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);

        DataSeeder seeder = new DataSeeder(userRepository, passwordEncoder);
        ReflectionTestUtils.setField(seeder, "adminUsername", "admin");
        ReflectionTestUtils.setField(seeder, "adminPassword", "   ");
        ReflectionTestUtils.setField(seeder, "adminEmail", "admin@example.com");
        ReflectionTestUtils.setField(seeder, "adminFullName", "System Administrator");

        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        seeder.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals("admin", savedUser.getUsername());
    }
}
