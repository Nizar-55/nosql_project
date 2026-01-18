package com.library.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Entité Neo4j représentant un utilisateur
 */
@Node("User")
public class User {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("username")
    private String username;
    
    @Property("email")
    private String email;
    
    @Property("password")
    private String password;
    
    @Property("firstName")
    private String firstName;
    
    @Property("lastName")
    private String lastName;
    
    @Property("bio")
    private String bio;
    
    @Property("profileImage")
    private String profileImage;
    
    @Property("enabled")
    private Boolean enabled = true;
    
    @Property("downloadCount")
    private Integer downloadCount = 0;
    
    // Relations Neo4j
    @Relationship(type = "HAS_ROLE", direction = Relationship.Direction.OUTGOING)
    private Role role;
    
    @Relationship(type = "FAVORITES", direction = Relationship.Direction.OUTGOING)
    private Set<Book> favorites = new HashSet<>();
    
    @Relationship(type = "DOWNLOADED", direction = Relationship.Direction.OUTGOING)
    private Set<DownloadHistory> downloadHistory = new HashSet<>();
    
    // Constructeurs
    public User() {
        this.enabled = true;
        this.downloadCount = 0;
    }
    
    public User(String username, String email, String password, String firstName, String lastName) {
        this();
        this.username = username;
        this.email = email;
        this.password = password;
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
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
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
    
    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public Set<Book> getFavorites() { return favorites; }
    public void setFavorites(Set<Book> favorites) { this.favorites = favorites; }
    
    public Set<DownloadHistory> getDownloadHistory() { return downloadHistory; }
    public void setDownloadHistory(Set<DownloadHistory> downloadHistory) { this.downloadHistory = downloadHistory; }
    
    // Méthodes utilitaires
    public void incrementDownloadCount() {
        this.downloadCount = (this.downloadCount == null ? 0 : this.downloadCount) + 1;
    }
    
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
    
    public void addFavorite(Book book) {
        if (favorites == null) {
            favorites = new HashSet<>();
        }
        favorites.add(book);
        if (book.getFavoriteByUsers() == null) {
            book.setFavoriteByUsers(new HashSet<>());
        }
        book.getFavoriteByUsers().add(this);
    }
    
    public void removeFavorite(Book book) {
        if (favorites != null) {
            favorites.remove(book);
        }
        if (book.getFavoriteByUsers() != null) {
            book.getFavoriteByUsers().remove(this);
        }
    }
}