package com.pfe.platform.config;

import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-password:}")
    private String adminPassword;

    @Value("${app.seed.operateur-password:}")
    private String operateurPassword;

    @Override
    public void run(String... args) {
        // Seule la table des utilisateurs applicatifs est initialisée, et uniquement si elle est vide.
        if (userRepo.count() > 0) {
            return;
        }
        log.info("Table des utilisateurs vide : création des comptes initiaux.");
        createUser("admin", "Administrateur Système", "admin@pfe.com", User.Role.ADMIN, adminPassword);
        createUser("operateur", "Opérateur Atelier", "operateur@pfe.com", User.Role.OPERATEUR, operateurPassword);
    }

    private void createUser(String username, String fullName, String email, User.Role role, String configured) {
        String password = configured;
        if (password == null || password.isBlank()) {
            byte[] bytes = new byte[12];
            new SecureRandom().nextBytes(bytes);
            password = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            log.warn("Mot de passe généré pour '{}' (à changer après la première connexion) : {}", username, password);
        }
        userRepo.save(User.builder()
            .username(username).password(passwordEncoder.encode(password))
            .fullName(fullName).email(email).role(role).build());
    }
}
