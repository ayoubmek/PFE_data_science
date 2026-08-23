package com.pfe.platform.dto;

import com.pfe.platform.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Size(min = 3, max = 50)
        private String username;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String fullName;
        @Email @NotBlank
        private String email;
        private User.Role role = User.Role.OPERATEUR;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String fullName;
        private String email;
        private String role;

        public AuthResponse(String token, User user) {
            this.token = token;
            this.username = user.getUsername();
            this.fullName = user.getFullName();
            this.email = user.getEmail();
            this.role = user.getRole().name();
        }
    }
}