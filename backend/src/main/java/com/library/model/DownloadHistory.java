package com.library.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.ZonedDateTime;

/**
 * Entité Neo4j représentant l'historique des téléchargements
 */
@Node("DownloadHistory")
public class DownloadHistory {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Relationship(type = "DOWNLOADED_BY", direction = Relationship.Direction.OUTGOING)
    private User user;
    
    @Relationship(type = "OF_BOOK", direction = Relationship.Direction.OUTGOING)
    private Book book;
    
    @Property("downloadedAt")
    private ZonedDateTime downloadedAt;
    
    @Property("ipAddress")
    private String ipAddress;
    
    @Property("userAgent")
    private String userAgent;
    
    // Constructeurs
    public DownloadHistory() {
        this.downloadedAt = ZonedDateTime.now();
    }
    
    public DownloadHistory(User user, Book book) {
        this();
        this.user = user;
        this.book = book;
    }
    
    public DownloadHistory(User user, Book book, String ipAddress) {
        this(user, book);
        this.ipAddress = ipAddress;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }
    
    public ZonedDateTime getDownloadedAt() { return downloadedAt; }
    public void setDownloadedAt(ZonedDateTime downloadedAt) { this.downloadedAt = downloadedAt; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    
    // Méthode appelée avant la sauvegarde
    public void prePersist() {
        if (downloadedAt == null) {
            downloadedAt = ZonedDateTime.now();
        }
    }
}