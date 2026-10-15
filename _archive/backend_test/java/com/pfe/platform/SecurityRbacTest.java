package com.pfe.platform;

import com.pfe.platform.controller.UserController;
import com.pfe.platform.dto.UserDTO;
import com.pfe.platform.entity.User;
import com.pfe.platform.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityRbacTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @Test
    @DisplayName("1. GET /api/users sans jeton JWT doit retourner 401 Unauthorized")
    public void testGetUsersUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "operateur", roles = {"OPERATEUR"})
    @DisplayName("2. GET /api/users avec rôle OPERATEUR doit retourner 403 Forbidden")
    public void testGetUsersForbiddenForOperateur() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("3. GET /api/users avec rôle ADMIN doit retourner 200 OK")
    public void testGetUsersAuthorizedForAdmin() throws Exception {
        when(userRepository.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("4. GET /api/ml/predict/production sans jeton doit retourner 401 Unauthorized")
    public void testGetMLUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/ml/predict/production"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "operateur", roles = {"OPERATEUR"})
    @DisplayName("5. GET /api/ml/predict/production avec rôle OPERATEUR doit retourner 403 Forbidden")
    public void testGetMLForbiddenForOperateur() throws Exception {
        mockMvc.perform(get("/api/ml/predict/production"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. GET /api/dashboard/summary est public et ne retourne ni 401 ni 403")
    public void testPublicDashboardSummary() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertNotEquals(401, status);
                    org.junit.jupiter.api.Assertions.assertNotEquals(403, status);
                });
    }
}
