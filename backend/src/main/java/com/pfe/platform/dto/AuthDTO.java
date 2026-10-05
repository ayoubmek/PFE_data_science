package com.pfe.platform.dto;

import com.pfe.platform.entity.User;
import jakarta.validation.constraints.NotBlank;
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