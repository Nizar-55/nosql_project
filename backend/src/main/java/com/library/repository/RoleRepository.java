package com.library.repository;

import com.library.model.Role;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository Neo4j pour les rôles
 */
@Repository
public interface RoleRepository extends Neo4jRepository<Role, Long> {
    
    // Recherche par nom de rôle
    @Query("MATCH (r:Role) WHERE r.name = $name RETURN r")
    Optional<Role> findByName(@Param("name") Role.RoleName name);
    
    // Vérifier si un rôle existe
    @Query("MATCH (r:Role) WHERE r.name = $name RETURN count(r) > 0")
    boolean existsByName(@Param("name") Role.RoleName name);
    
    // Compter les utilisateurs par rôle
    @Query("MATCH (r:Role)<-[:HAS_ROLE]-(u:User) WHERE ID(r) = $roleId RETURN count(u)")
    Long countUsersByRoleId(@Param("roleId") Long roleId);
    
    // Obtenir tous les rôles avec le nombre d'utilisateurs
    @Query("MATCH (r:Role) " +
           "OPTIONAL MATCH (r)<-[:HAS_ROLE]-(u:User) " +
           "RETURN r, count(u) as userCount " +
           "ORDER BY r.name")
    RoleWithUserCount findAllWithUserCount();
    
    // Interface pour les statistiques
    interface RoleWithUserCount {
        Role getRole();
        Long getUserCount();
    }
}