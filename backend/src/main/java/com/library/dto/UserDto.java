package com.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;
import java.util.Set;

/**
 * DTO pour les données utilisateur
 */
public class UserDto {
    
    private Long id;
    
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(max = 50)
    private String firstName;
    
    @NotBlank
    @Size(max = 50)
    private String lastName;
    
    private String bio;
    private String profileImage;
    private Boolean enabled;
    private String roleName;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private Set<Long> favoriteBookIds;
    private int downloadCount;
    
    // Constructeurs
    public UserDto() {}
    
    public UserDto(Long id, String username, String email, String firstName, String lastName) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
    
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Set<Long> getFavoriteBookIds() { return favoriteBookIds; }
    public void setFavoriteBookIds(Set<Long> favoriteBookIds) { this.favoriteBookIds = favoriteBookIds; }
    
    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }
    
    // Méthodes utilitaires
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    /**
     * Convertit une entité User en UserDto
     */
    public static UserDto fromEntity(com.library.model.User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setBio(user.getBio());
        dto.setProfileImage(user.getProfileImage());
        dto.setEnabled(user.getEnabled());
        // DateTime fields removed temporarily
        
        if (user.getRole() != null) {
            dto.setRoleName(user.getRole().getName().name());
        }
        
        if (user.getFavorites() != null) {
            dto.setFavoriteBookIds(user.getFavorites().stream()
                .map(com.library.model.Book::getId)
                .collect(java.util.stream.Collectors.toSet()));
        }
        
        if (user.getDownloadHistory() != null) {
            dto.setDownloadCount(user.getDownloadHistory().size());
        }
        
        return dto;
    }
    
    /**
     * DTO pour la mise à jour du profil utilisateur
     */
    public static class UpdateRequest {
        private String firstName;
        private String lastName;
        private String bio;
        
        // Getters et Setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
    }
}