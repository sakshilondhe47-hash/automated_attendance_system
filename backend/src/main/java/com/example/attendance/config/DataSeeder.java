package com.example.attendance.config;

import com.example.attendance.entity.User;
import com.example.attendance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Value("${app.seed.admin.username}")
    private String adminUsername;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Value("${app.seed.admin.email}")
    private String adminEmail;

    @Value("${app.seed.admin.full-name}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        String effectivePassword = (adminPassword == null || adminPassword.isBlank())
                ? DEFAULT_ADMIN_PASSWORD
                : adminPassword;

        User admin = userRepository.findByUsername(adminUsername).orElseGet(User::new);
        boolean isNewUser = admin.getId() == null;

        if (isNewUser) {
            admin.setUsername(adminUsername);
        }

        admin.setPassword(passwordEncoder.encode(effectivePassword));
        admin.setEmail(adminEmail);
        admin.setFullName(adminFullName);
        admin.setRole("ADMIN");
        userRepository.save(admin);
    }
}
