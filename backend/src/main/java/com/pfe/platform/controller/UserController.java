package com.pfe.platform.controller;

import com.pfe.platform.dto.UserDTO;
import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class UserController {
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream().map(UserDTO::fromEntity).toList());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        String username = normalize(request.getUsername());
        String email = normalize(request.getEmail());
        if (username.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'utilisateur requis");
        }
        if (email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adresse e-mail requise");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur est déjà utilisé");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée");
        }
        checkPassword(request.getPassword());

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName().trim() : username)
                .email(email)
                .role(request.getRole() != null ? request.getRole() : User.Role.OPERATEUR)
                .enabled(request.isEnabled())
                .build();

        User saved = userRepository.save(user);
        log.info("Created user id={} username={} role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        User user = findUser(id);
        User.Role newRole = request.getRole() != null ? request.getRole() : user.getRole();
        boolean losesAdminAccess = newRole != User.Role.ADMIN || !request.isEnabled();
        if (losesAdminAccess && isLastActiveAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible de retirer le dernier administrateur actif");
        }
        if (!request.isEnabled() && isCurrentUser(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous ne pouvez pas désactiver votre propre compte");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        String email = normalize(request.getEmail());
        if (!email.isEmpty()) {
            if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée par un autre compte");
            }
            user.setEmail(email);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            checkPassword(request.getPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setRole(newRole);
        user.setEnabled(request.isEnabled());

        User saved = userRepository.save(user);
        log.info("Updated user id={} username={} role={} enabled={}", saved.getId(), saved.getUsername(), saved.getRole(), saved.isEnabled());
        return ResponseEntity.ok(UserDTO.fromEntity(saved));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserDTO> toggleStatus(@PathVariable Long id) {
        User user = findUser(id);
        if (user.isEnabled() && isCurrentUser(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous ne pouvez pas désactiver votre propre compte");
        }
        if (user.isEnabled() && isLastActiveAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible de désactiver le dernier administrateur actif");
        }
        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);
        log.info("Toggled user id={} username={} enabled={}", saved.getId(), saved.getUsername(), saved.isEnabled());
        return ResponseEntity.ok(UserDTO.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = findUser(id);
        if (isCurrentUser(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vous ne pouvez pas supprimer votre propre compte");
        }
        if (isLastActiveAdmin(user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossible de supprimer le dernier administrateur actif");
        }
        userRepository.delete(user);
        log.info("Deleted user id={}", id);
        return ResponseEntity.noContent().build();
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private boolean isLastActiveAdmin(User user) {
        return user.getRole() == User.Role.ADMIN && user.isEnabled()
                && userRepository.countByRoleAndEnabledTrue(User.Role.ADMIN) <= 1;
    }

    private boolean isCurrentUser(User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && user.getUsername().equalsIgnoreCase(auth.getName());
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static void checkPassword(String password) {
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le mot de passe doit contenir au moins " + MIN_PASSWORD_LENGTH + " caractères");
        }
    }

    @Data
    public static class CreateUserRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private User.Role role;
        private boolean enabled = true;
    }

    @Data
    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private User.Role role;
        private String password;
        private boolean enabled;
    }
}
