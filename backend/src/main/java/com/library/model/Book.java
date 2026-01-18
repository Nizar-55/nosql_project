package com.library.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité Neo4j représentant un livre
 */
@Node("Book")
public class Book {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("title")
    private String title;
    
    @Property("author")
    private String author;
    
    @Property("isbn")
    private String isbn;
    
    @Property("description")
    private String description;
    
    @Property("publicationYear")
    private Integer publicationYear;
    
    @Property("pageCount")
    private Integer pageCount;
    
    @Property("language")
    private String language;
    
    @Property("coverImage")
    private String coverImage;
    
    @Property("pdfFile")
    private String pdfFile;
    
    @Property("fileSize")
    private Long fileSize;
    
    @Property("downloadCount")
    private Long downloadCount = 0L;
    
    @Property("favoriteCount")
    private Long favoriteCount = 0L;
    
    @Property("available")
    private Boolean available = true;
    
    @Property("createdAt")
    private ZonedDateTime createdAt;
    
    @Property("updatedAt")
    private ZonedDateTime updatedAt;
    
    // Relations Neo4j
    @Relationship(type = "BELONGS_TO", direction = Relationship.Direction.OUTGOING)
    private Category category;
    
    @Relationship(type = "HAS_TAG", direction = Relationship.Direction.OUTGOING)
    private Set<Tag> tags = new HashSet<>();
    
    @Relationship(type = "FAVORITES", direction = Relationship.Direction.INCOMING)
    private Set<User> favoriteByUsers = new HashSet<>();
    
    @Relationship(type = "OF_BOOK", direction = Relationship.Direction.INCOMING)
    private Set<DownloadHistory> downloadHistory = new HashSet<>();
    
    // Constructeurs
    public Book() {
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
        this.downloadCount = 0L;
        this.favoriteCount = 0L;
        this.available = true;
    }
    
    public Book(String title, String author, Category category) {
        this();
        this.title = title;
        this.author = author;
        this.category = category;
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
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) { this.tags = tags; }
    
    public Set<User> getFavoriteByUsers() { return favoriteByUsers; }
    public void setFavoriteByUsers(Set<User> favoriteByUsers) { this.favoriteByUsers = favoriteByUsers; }
    
    public Set<DownloadHistory> getDownloadHistory() { return downloadHistory; }
    public void setDownloadHistory(Set<DownloadHistory> downloadHistory) { this.downloadHistory = downloadHistory; }
    
    // Méthodes utilitaires
    public void incrementDownloadCount() {
        this.downloadCount = (this.downloadCount == null ? 0L : this.downloadCount) + 1;
    }
    
    public void incrementFavoriteCount() {
        this.favoriteCount = (this.favoriteCount == null ? 0L : this.favoriteCount) + 1;
    }
    
    public void decrementFavoriteCount() {
        this.favoriteCount = Math.max(0L, (this.favoriteCount == null ? 0L : this.favoriteCount) - 1);
    }
    
    public void addTag(Tag tag) {
        if (tags == null) {
            tags = new HashSet<>();
        }
        tags.add(tag);
        if (tag.getBooks() == null) {
            tag.setBooks(new HashSet<>());
        }
        tag.getBooks().add(this);
    }
    
    public void removeTag(Tag tag) {
        if (tags != null) {
            tags.remove(tag);
        }
        if (tag.getBooks() != null) {
            tag.getBooks().remove(this);
        }
    }
    
    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }
    
    public Long getCategoryId() {
        return category != null ? category.getId() : null;
    }
    
    // Méthode appelée avant la sauvegarde
    public void prePersist() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        updatedAt = ZonedDateTime.now();
    }
}