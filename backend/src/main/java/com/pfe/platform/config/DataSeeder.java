package com.pfe.platform.config;

import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seule la table app_users est initialisée pour permettre la connexion
        if (userRepo.count() == 0) {
            log.info("Initialisation des utilisateurs par défaut...");
            seedUsers();
            log.info("Utilisateurs initialisés avec succès.");
        }
    }

    private void seedUsers() {
        userRepo.save(User.builder()
            .username("admin").password(passwordEncoder.encode("admin123"))
            .fullName("Administrateur Système").email("admin@pfe.com")
            .role(User.Role.ADMIN).build());
        userRepo.save(User.builder()
            .username("operateur").password(passwordEncoder.encode("operateur123"))
            .fullName("Opérateur Atelier").email("operateur@pfe.com")
            .role(User.Role.OPERATEUR).build());
    }
}