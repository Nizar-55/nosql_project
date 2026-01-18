package com.library.repository;

import com.library.model.User;
import com.library.model.Role;
import com.library.model.DownloadHistory;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository Neo4j pour les utilisateurs
 */
@Repository
public interface UserRepository extends Neo4jRepository<User, Long> {
    
    // Recherche par nom d'utilisateur avec rôle
    Optional<User> findByUsername(String username);
    
    // Recherche par email avec rôle
    Optional<User> findByEmail(String email);
    
    // Vérifier si un nom d'utilisateur existe
    @Query("MATCH (u:User) WHERE u.username = $username RETURN count(u) > 0")
    boolean existsByUsername(@Param("username") String username);
    
    // Vérifier si un email existe
    @Query("MATCH (u:User) WHERE u.email = $email RETURN count(u) > 0")
    boolean existsByEmail(@Param("email") String email);
    
    // Recherche par rôle
    @Query("MATCH (u:User)-[:HAS_ROLE]->(r:Role) WHERE r.name = $roleName RETURN u")
    List<User> findByRoleName(@Param("roleName") Role.RoleName roleName);
    
    // Recherche par statut activé
    @Query("MATCH (u:User) WHERE u.enabled = $enabled RETURN u")
    List<User> findByEnabled(@Param("enabled") Boolean enabled);
    
    // Recherche avec filtres et pagination
    @Query("MATCH (u:User) " +
           "OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role) " +
           "WHERE ($search IS NULL OR " +
           "  toLower(u.username) CONTAINS toLower($search) OR " +
           "  toLower(u.email) CONTAINS toLower($search)) " +
           "  AND ($enabled IS NULL OR u.enabled = $enabled) " +
           "  AND ($roleName IS NULL OR r.name = $roleName) " +
           "RETURN u ORDER BY u.createdAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<User> findUsersWithFiltersPaginated(
        @Param("search") String search,
        @Param("enabled") Boolean enabled,
        @Param("roleName") Role.RoleName roleName,
        @Param("skip") int skip,
        @Param("limit") int limit
    );

    // Compter les utilisateurs avec filtres
    @Query("MATCH (u:User) " +
           "OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role) " +
           "WHERE ($search IS NULL OR " +
           "  toLower(u.username) CONTAINS toLower($search) OR " +
           "  toLower(u.email) CONTAINS toLower($search)) " +
           "  AND ($enabled IS NULL OR u.enabled = $enabled) " +
           "  AND ($roleName IS NULL OR r.name = $roleName) " +
           "RETURN count(u)")
    Long countUsersWithFilters(
        @Param("search") String search,
        @Param("enabled") Boolean enabled,
        @Param("roleName") Role.RoleName roleName
    );
    
    // Utilisateurs les plus actifs (par nombre de téléchargements)
    @Query("MATCH (u:User) " +
           "WHERE u.enabled = true " +
           "RETURN u ORDER BY u.downloadCount DESC LIMIT $limit")
    List<User> findMostActiveUsers(@Param("limit") int limit);
    
    // Utilisateurs avec le plus de favoris
    @Query("MATCH (u:User)-[:FAVORITES]->(b:Book) " +
           "WITH u, count(b) as favoriteCount " +
           "WHERE favoriteCount > 0 " +
           "RETURN u ORDER BY favoriteCount DESC LIMIT $limit")
    List<User> findUsersWithMostFavorites(@Param("limit") int limit);
    
    // Compter les utilisateurs par rôle
    @Query("MATCH (u:User)-[:HAS_ROLE]->(r:Role) " +
           "WHERE r.name = $roleName " +
           "RETURN count(u)")
    Long countByRoleName(@Param("roleName") Role.RoleName roleName);
    
    // Statistiques des utilisateurs
    @Query("MATCH (u:User) " +
           "OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role) " +
           "RETURN count(u) as totalUsers, " +
           "       sum(CASE WHEN u.enabled = true THEN 1 ELSE 0 END) as enabledUsers, " +
           "       sum(CASE WHEN r.name = 'ADMIN' THEN 1 ELSE 0 END) as adminUsers, " +
           "       avg(u.downloadCount) as avgDownloads")
    UserStats getUserStatistics();
    
    // Recherche d'utilisateurs avec pagination
    @Query("MATCH (u:User) " +
           "WHERE ($search IS NULL OR " +
           "  toLower(u.username) CONTAINS toLower($search) OR " +
           "  toLower(u.email) CONTAINS toLower($search) OR " +
           "  toLower(u.firstName) CONTAINS toLower($search) OR " +
           "  toLower(u.lastName) CONTAINS toLower($search)" +
           ") RETURN u ORDER BY u.createdAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<User> searchUsersPaginated(@Param("search") String search, @Param("skip") int skip, @Param("limit") int limit);
    
    // Compter les utilisateurs actifs
    @Query("MATCH (u:User) WHERE u.enabled = true RETURN count(u)")
    Long countActiveUsers();
    
    // Historique des téléchargements par utilisateur (ordonné)
    @Query("MATCH (u:User)<-[:DOWNLOADED_BY]-(dh:DownloadHistory) " +
           "WHERE ID(u) = $userId " +
           "RETURN dh ORDER BY dh.downloadedAt DESC")
    List<DownloadHistory> findDownloadHistoryByUserIdOrderByDownloadedAtDesc(@Param("userId") Long userId);
    
    // Interface pour les statistiques
    interface UserStats {
        Long getTotalUsers();
        Long getEnabledUsers();
        Long getAdminUsers();
        Double getAvgDownloads();
    }
}