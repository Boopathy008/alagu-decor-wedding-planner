package com.alagu.decor.config;

import com.alagu.decor.entity.Admin;
import com.alagu.decor.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates exactly one admin account on first boot, from env vars, if the
 * admins table is empty. Safe to leave in place permanently: it never
 * touches an existing admin, and never runs if any admin already exists.
 *
 * IMPORTANT: change INITIAL_ADMIN_PASSWORD's login password immediately
 * after first login in a real deployment.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.initial-admin.email:}")
    private String initialAdminEmail;

    @Value("${app.initial-admin.password:}")
    private String initialAdminPassword;

    public AdminSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.count() > 0) {
            return;
        }
        if (initialAdminEmail.isBlank() || initialAdminPassword.isBlank()) {
            log.warn("No admin account exists and INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD " +
                    "are not set. Set them in .env and restart to create the first admin.");
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(initialAdminEmail.trim().toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(initialAdminPassword));
        admin.setRole("ADMIN");
        adminRepository.save(admin);

        log.info("Seeded initial admin account for {}", admin.getEmail());
    }
}
