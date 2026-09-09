package com.pfe.platform.controller;

import com.pfe.platform.dto.UserDTO;
import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'utilisateur requis");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adresse e-mail requise");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur est déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() 
                : "Password123!";

        User user = User.builder()
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(rawPassword))
                .fullName(request.getFullName() != null ? request.getFullName().trim() : request.getUsername())
                .email(request.getEmail().trim().toLowerCase())
                .role(request.getRole() != null ? request.getRole() : User.Role.OPERATEUR)
                .enabled(request.isEnabled())
                .build();

        User saved = userRepository.save(user);
        log.info("Created user id={} username={} role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette adresse e-mail est déjà utilisée par un autre compte");
            }
            user.setEmail(newEmail);
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        user.setEnabled(request.isEnabled());

        User saved = userRepository.save(user);
        log.info("Updated user id={} username={} role={} enabled={}", saved.getId(), saved.getUsername(), saved.getRole(), saved.isEnabled());
        return ResponseEntity.ok(UserDTO.fromEntity(saved));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<UserDTO> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        user.setEnabled(!user.isEnabled());
        User saved = userRepository.save(user);
        log.info("Toggled user id={} username={} new enabled={}", saved.getId(), saved.getUsername(), saved.isEnabled());
        return ResponseEntity.ok(UserDTO.fromEntity(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable");
        }
        userRepository.deleteById(id);
        log.info("Deleted user id={}", id);
        return ResponseEntity.noContent().build();
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
