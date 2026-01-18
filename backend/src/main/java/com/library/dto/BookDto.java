package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;
import java.util.Set;

/**
 * DTO pour les données de livre
 */
public class BookDto {
    
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    private String title;
    
    @NotBlank
    @Size(max = 100)
    private String author;
    
    private String isbn;
    private String description;
    private Integer publicationYear;
    private Integer pageCount;
    private String language;
    private String coverImage;
    private String pdfFile;
    private Long fileSize;
    private Long downloadCount;
    private Long favoriteCount;
    private Boolean available;
    
    @NotNull
    private Long categoryId;
    private String categoryName;
    
    private Set<Long> tagIds;
    private Set<String> tagNames;
    
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    private Boolean isFavorite; // Pour l'utilisateur connecté
    private Double recommendationScore; // Pour les recommandations
    
    // Constructeurs
    public BookDto() {}
    
    public BookDto(Long id, String title, String author, Long categoryId) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.categoryId = categoryId;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    
    public Integer getPageCount() { return pageCount; }
    public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    
    public String getPdfFile() { return pdfFile; }
    public void setPdfFile(String pdfFile) { this.pdfFile = pdfFile; }
    
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    
    public Long getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Long downloadCount) { this.downloadCount = downloadCount; }
    
    public Long getFavoriteCount() { return favoriteCount; }
    public void setFavoriteCount(Long favoriteCount) { this.favoriteCount = favoriteCount; }
    
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public Set<Long> getTagIds() { return tagIds; }
    public void setTagIds(Set<Long> tagIds) { this.tagIds = tagIds; }
    
    public Set<String> getTagNames() { return tagNames; }
    public void setTagNames(Set<String> tagNames) { this.tagNames = tagNames; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Boolean getIsFavorite() { return isFavorite; }
    public void setIsFavorite(Boolean isFavorite) { this.isFavorite = isFavorite; }
    
    public Double getRecommendationScore() { return recommendationScore; }
    public void setRecommendationScore(Double recommendationScore) { this.recommendationScore = recommendationScore; }
    
    // Méthodes utilitaires
    public String getFormattedFileSize() {
        if (fileSize == null) return "N/A";
        
        double size = fileSize.doubleValue();
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }
    
    /**
     * Convertit une entité Book en BookDto
     */
    public static BookDto fromEntity(com.library.model.Book book) {
        if (book == null) {
            return null;
        }
        
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getDescription());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setPageCount(book.getPageCount());
        dto.setLanguage(book.getLanguage());
        dto.setCoverImage(book.getCoverImage());
        dto.setPdfFile(book.getPdfFile());
        dto.setFileSize(book.getFileSize());
        dto.setDownloadCount(book.getDownloadCount());
        dto.setFavoriteCount(book.getFavoriteCount());
        dto.setAvailable(book.getAvailable());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        
        // Gestion sécurisée de la catégorie
        try {
            if (book.getCategory() != null) {
                dto.setCategoryId(book.getCategory().getId());
                dto.setCategoryName(book.getCategory().getName());
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération de la catégorie pour le livre ID: " + book.getId());
        }
        
        // Gestion sécurisée des tags
        try {
            if (book.getTags() != null) {
                dto.setTagNames(book.getTags().stream()
                    .map(com.library.model.Tag::getName)
                    .collect(java.util.stream.Collectors.toSet()));
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des tags pour le livre ID: " + book.getId());
        }
        
        return dto;
    }
    
    /**
     * DTO pour la création d'un livre
     */
    public static class CreateRequest {
        @NotBlank
        @Size(max = 200)
        private String title;
        
        @NotBlank
        @Size(max = 100)
        private String author;
        
        private String isbn;
        private String description;
        private Integer publicationYear;
        private Integer pageCount;
        private String language;
        
        @NotNull
        private Long categoryId;
        
        private Set<String> tagNames;
        
        // Getters et Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
        
        public Integer getPageCount() { return pageCount; }
        public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
        
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public Set<String> getTagNames() { return tagNames; }
        public void setTagNames(Set<String> tagNames) { this.tagNames = tagNames; }
    }
    
    /**
     * DTO pour la mise à jour d'un livre
     */
    public static class UpdateRequest {
        private String title;
        private String author;
        private String isbn;
        private String description;
        private Integer publicationYear;
        private Integer pageCount;
        private String language;
        private Long categoryId;
        private Set<String> tagNames;
        
        // Getters et Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        
        public String getIsbn() { return isbn; }
        public void setIsbn(String isbn) { this.isbn = isbn; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Integer getPublicationYear() { return publicationYear; }
        public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
        
        public Integer getPageCount() { return pageCount; }
        public void setPageCount(Integer pageCount) { this.pageCount = pageCount; }
        
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
        
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public Set<String> getTagNames() { return tagNames; }
        public void setTagNames(Set<String> tagNames) { this.tagNames = tagNames; }
    }
}