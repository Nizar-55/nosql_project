package com.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs pour l'authentification
 */
public class AuthDto {
    
    /**
     * DTO pour la connexion
     */
    public static class LoginRequest {
        @NotBlank
        private String username;
        
        @NotBlank
        private String password;
        
        // Constructeurs
        public LoginRequest() {}
        
        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }
        
        // Getters et Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    /**
     * DTO pour l'inscription
     */
    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String username;
        
        @NotBlank
        @Email
        private String email;
        
        @NotBlank
        @Size(min = 6, max = 100)
        private String password;
        
        @NotBlank
        @Size(max = 50)
        private String firstName;
        
        @NotBlank
        @Size(max = 50)
        private String lastName;
        
        // Constructeurs
        public RegisterRequest() {}
        
        // Getters et Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }
    
    /**
     * DTO pour la réponse d'authentification
     */
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String type = "Bearer";
        private UserDto user;
        
        // Constructeurs
        public AuthResponse() {}
        
        public AuthResponse(String token, String refreshToken, UserDto user) {
            this.token = token;
            this.refreshToken = refreshToken;
            this.user = user;
        }
        
        // Getters et Setters
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }
    
    /**
     * DTO pour le rafraîchissement du token
     */
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
        
        // Constructeurs
        public RefreshTokenRequest() {}
        
        public RefreshTokenRequest(String refreshToken) {
            this.refreshToken = refreshToken;
        }
        
        // Getters et Setters
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }
    
    /**
     * DTO pour la réponse JWT
     */
    public static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private String role;
        
        public JwtResponse(String accessToken, Long id, String username, String email, String role) {
            this.token = accessToken;
            this.id = id;
            this.username = username;
            this.email = email;
            this.role = role;
        }
        
        // Getters et Setters
        public String getAccessToken() { return token; }
        public void setAccessToken(String accessToken) { this.token = accessToken; }
        
        public String getTokenType() { return type; }
        public void setTokenType(String tokenType) { this.type = tokenType; }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
    
    /**
     * DTO pour les messages de réponse
     */
    public static class MessageResponse {
        private String message;
        
        public MessageResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}