package com.library.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Entité Neo4j représentant les rôles des utilisateurs
 */
@Node("Role")
public class Role {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Property("name")
    private RoleName name;
    
    @Property("description")
    private String description;
    
    @Relationship(type = "HAS_ROLE", direction = Relationship.Direction.INCOMING)
    private Set<User> users = new HashSet<>();
    
    // Constructeurs
    public Role() {
        // Constructeur par défaut
    }
    
    public Role(RoleName name) {
        this.name = name;
    }
    
    public Role(RoleName name, String description) {
        this(name);
        this.description = description;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public RoleName getName() { return name; }
    public void setName(RoleName name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Set<User> getUsers() { return users; }
    public void setUsers(Set<User> users) { this.users = users; }
    
    /**
     * Énumération des rôles disponibles
     */
    public enum RoleName {
        ADMIN("Administrateur avec tous les privilèges"),
        USER("Utilisateur standard avec accès limité");
        
        private final String description;
        
        RoleName(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}