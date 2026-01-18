package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;

/**
 * DTO pour les tags
 */
public class TagDto {
    
    private Long id;
    
    @NotBlank
    @Size(max = 50)
    private String name;
    
    private String description;
    private String color;
    private Long bookCount;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    // Constructeurs
    public TagDto() {}
    
    public TagDto(Long id, String name, String description) {
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
    
    public Long getBookCount() { return bookCount; }
    public void setBookCount(Long bookCount) { this.bookCount = bookCount; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    /**
     * Convertit une entité Tag en TagDto
     */
    public static TagDto fromEntity(com.library.model.Tag tag) {
        TagDto dto = new TagDto();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setDescription(tag.getDescription());
        dto.setColor(tag.getColor());
        dto.setCreatedAt(tag.getCreatedAt());
        dto.setUpdatedAt(tag.getUpdatedAt());
        
        if (tag.getBooks() != null) {
            dto.setBookCount((long) tag.getBooks().size());
        }
        
        return dto;
    }
    
    /**
     * DTO pour la création d'un tag
     */
    public static class CreateRequest {
        @NotBlank
        @Size(max = 50)
        private String name;
        
        private String description;
        private String color;
        
        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
    
    /**
     * DTO pour la mise à jour d'un tag
     */
    public static class UpdateRequest {
        private String name;
        private String description;
        private String color;
        
        // Getters et Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
}