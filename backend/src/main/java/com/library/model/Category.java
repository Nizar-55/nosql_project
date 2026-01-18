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
 * Entité Neo4j représentant une catégorie de livres
 */
@Node("Category")
public class Category {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("name")
    private String name;
    
    @Property("description")
    private String description;
    
    @Property("icon")
    private String icon;
    
    @Property("color")
    private String color;
    
    @Property("createdAt")
    private ZonedDateTime createdAt;
    
    @Property("updatedAt")
    private ZonedDateTime updatedAt;
    
    @Relationship(type = "BELONGS_TO", direction = Relationship.Direction.INCOMING)
    private Set<Book> books = new HashSet<>();
    
    // Constructeurs
    public Category() {
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
    }
    
    public Category(String name) {
        this();
        this.name = name;
    }
    
    public Category(String name, String description) {
        this(name);
        this.description = description;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Set<Book> getBooks() { return books; }
    public void setBooks(Set<Book> books) { this.books = books; }
    
    // Méthodes utilitaires
    public int getBookCount() {
        return books != null ? books.size() : 0;
    }
    
    // Méthode appelée avant la sauvegarde
    public void prePersist() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        updatedAt = ZonedDateTime.now();
    }
}