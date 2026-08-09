package com.pfe.platform.service;

import com.pfe.platform.dto.AuthDTO;
import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import com.pfe.platform.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Autowired
    public AuthService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder, JwtUtil jwtUtil, @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        // Support login by email or username
        String identifier = request.getUsername();
        User user = identifier.contains("@")
            ? userRepository.findByEmail(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"))
            : userRepository.findByUsername(identifier)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé"));

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );
        String token = jwtUtil.generateToken(user);
        return new AuthDTO.AuthResponse(token, user);
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Nom d'utilisateur déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        User user = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .fullName(request.getFullName())
            .email(request.getEmail())
            .role(request.getRole())
            .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return new AuthDTO.AuthResponse(token, user);
    }
}
