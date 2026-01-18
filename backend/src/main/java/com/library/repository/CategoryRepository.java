package com.library.repository;

import com.library.model.Category;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository Neo4j pour les catégories
 */
@Repository
public interface CategoryRepository extends Neo4jRepository<Category, Long> {
    
    // Recherche par nom (insensible à la casse)
    @Query("MATCH (c:Category) WHERE toLower(c.name) = toLower($name) RETURN c")
    Optional<Category> findByNameIgnoreCase(@Param("name") String name);
    
    // Recherche par nom exact
    @Query("MATCH (c:Category) WHERE c.name = $name RETURN c")
    Optional<Category> findByName(@Param("name") String name);
    
    // Vérifier si une catégorie existe
    @Query("MATCH (c:Category) WHERE c.name = $name RETURN count(c) > 0")
    boolean existsByName(@Param("name") String name);
    
    // Recherche par couleur
    @Query("MATCH (c:Category) WHERE c.color = $color RETURN c")
    List<Category> findByColor(@Param("color") String color);
    
    // Catégories avec le nombre de livres
    @Query("MATCH (c:Category) " +
           "OPTIONAL MATCH (c)<-[:BELONGS_TO]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH c, count(b) as bookCount " +
           "RETURN c ORDER BY bookCount DESC, c.name ASC")
    List<Category> findAllWithBookCount();
    
    // Catégories les plus populaires (par nombre de livres)
    @Query("MATCH (c:Category)<-[:BELONGS_TO]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH c, count(b) as bookCount " +
           "WHERE bookCount > 0 " +
           "RETURN c ORDER BY bookCount DESC LIMIT $limit")
    List<Category> findMostPopularCategories(@Param("limit") int limit);
    
    // Catégories avec des livres récents
    @Query("MATCH (c:Category)<-[:BELONGS_TO]-(b:Book) " +
           "WHERE b.available = true AND b.createdAt >= $sinceDate " +
           "WITH c, count(b) as recentBooks " +
           "WHERE recentBooks > 0 " +
           "RETURN c ORDER BY recentBooks DESC")
    List<Category> findCategoriesWithRecentBooks(@Param("sinceDate") String sinceDate);
    
    // Compter les livres par catégorie
    @Query("MATCH (c:Category)<-[:BELONGS_TO]-(b:Book) " +
           "WHERE ID(c) = $categoryId AND b.available = true " +
           "RETURN count(b)")
    Long countBooksByCategoryId(@Param("categoryId") Long categoryId);
    
    // Statistiques des catégories
    @Query("MATCH (c:Category) " +
           "OPTIONAL MATCH (c)<-[:BELONGS_TO]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH c, count(b) as bookCount, sum(b.downloadCount) as totalDownloads " +
           "RETURN c.name as categoryName, " +
           "       bookCount, " +
           "       totalDownloads, " +
           "       CASE WHEN bookCount > 0 THEN totalDownloads / bookCount ELSE 0 END as avgDownloadsPerBook " +
           "ORDER BY totalDownloads DESC")
    List<CategoryStats> getCategoryStatistics();
    
    // Interface pour les statistiques
    interface CategoryStats {
        String getCategoryName();
        Long getBookCount();
        Long getTotalDownloads();
        Double getAvgDownloadsPerBook();
    }
}