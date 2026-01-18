package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;

/**
 * DTO pour les catégories
 */
public class CategoryDto {
    
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    private String name;
    
    private String description;
    private String color;
    private String icon;
    private Long bookCount;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Constructeurs
    public CategoryDto() {}
    
    public CategoryDto(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public Long getBookCount() { return bookCount; }
    public void setBookCount(Long bookCount) { this.bookCount = bookCount; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    /**
     * Convertit une entité Category en CategoryDto
     */
    public static CategoryDto fromEntity(com.library.model.Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setColor(category.getColor());
        dto.setIcon(category.getIcon());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        
        if (category.getBooks() != null) {
            dto.setBookCount((long) category.getBooks().size());
        }
        
        return dto;
    }
    
    /**
     * DTO pour la création d'une catégorie
     */
    public static class CreateRequest {
        @NotBlank
        @Size(max = 100)
        private String name;
        
        private String description;
        private String color;
        private String icon;
        
        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }
    
    /**
     * DTO pour la mise à jour d'une catégorie
     */
    public static class UpdateRequest {
        private String name;
        private String description;
        private String color;
        private String icon;
        
        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
        
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
    }
}