package com.pfe.platform.controller;

import com.pfe.platform.dto.AuthDTO;
import com.pfe.platform.dto.UserDTO;
import com.pfe.platform.entity.User;
import com.pfe.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthResponse> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Profil de l'utilisateur porteur du jeton JWT (utilisé par le frontend pour valider la session). */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
