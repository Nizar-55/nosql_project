package com.library.repository;

import com.library.model.Tag;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository Neo4j pour les tags
 */
@Repository
public interface TagRepository extends Neo4jRepository<Tag, Long> {
    
    // Recherche par nom (insensible à la casse)
    @Query("MATCH (t:Tag) WHERE toLower(t.name) = toLower($name) RETURN t")
    Optional<Tag> findByNameIgnoreCase(@Param("name") String name);
    
    // Recherche par nom exact
    @Query("MATCH (t:Tag) WHERE t.name = $name RETURN t")
    Optional<Tag> findByName(@Param("name") String name);
    
    // Vérifier si un tag existe
    @Query("MATCH (t:Tag) WHERE t.name = $name RETURN count(t) > 0")
    boolean existsByName(@Param("name") String name);
    
    // Recherche par couleur
    @Query("MATCH (t:Tag) WHERE t.color = $color RETURN t")
    List<Tag> findByColor(@Param("color") String color);
    
    // Recherche textuelle dans le nom
    @Query("MATCH (t:Tag) WHERE toLower(t.name) CONTAINS toLower($query) RETURN t ORDER BY t.name")
    List<Tag> findByNameContainingIgnoreCase(@Param("query") String query);
    
    // Tags avec le nombre de livres
    @Query("MATCH (t:Tag) " +
           "OPTIONAL MATCH (t)<-[:HAS_TAG]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH t, count(b) as bookCount " +
           "RETURN t ORDER BY bookCount DESC, t.name ASC")
    List<Tag> findAllWithBookCount();
    
    // Tags les plus populaires (par nombre de livres)
    @Query("MATCH (t:Tag)<-[:HAS_TAG]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH t, count(b) as bookCount " +
           "WHERE bookCount > 0 " +
           "RETURN t ORDER BY bookCount DESC LIMIT $limit")
    List<Tag> findMostPopularTags(@Param("limit") int limit);
    
    // Tags utilisés avec des livres récents
    @Query("MATCH (t:Tag)<-[:HAS_TAG]-(b:Book) " +
           "WHERE b.available = true AND b.createdAt >= $sinceDate " +
           "WITH t, count(b) as recentBooks " +
           "WHERE recentBooks > 0 " +
           "RETURN t ORDER BY recentBooks DESC")
    List<Tag> findTagsWithRecentBooks(@Param("sinceDate") String sinceDate);
    
    // Compter les livres par tag
    @Query("MATCH (t:Tag)<-[:HAS_TAG]-(b:Book) " +
           "WHERE ID(t) = $tagId AND b.available = true " +
           "RETURN count(b)")
    Long countBooksByTagId(@Param("tagId") Long tagId);
    
    // Tags suggérés basés sur un livre
    @Query("MATCH (book:Book)-[:HAS_TAG]->(relatedTag:Tag)<-[:HAS_TAG]-(otherBook:Book)-[:HAS_TAG]->(suggestedTag:Tag) " +
           "WHERE ID(book) = $bookId AND suggestedTag <> relatedTag " +
           "  AND NOT (book)-[:HAS_TAG]->(suggestedTag) " +
           "WITH suggestedTag, count(*) as relevance " +
           "RETURN suggestedTag ORDER BY relevance DESC LIMIT $limit")
    List<Tag> findSuggestedTagsForBook(@Param("bookId") Long bookId, @Param("limit") int limit);
    
    // Statistiques des tags
    @Query("MATCH (t:Tag) " +
           "OPTIONAL MATCH (t)<-[:HAS_TAG]-(b:Book) " +
           "WHERE b.available = true " +
           "WITH t, count(b) as bookCount, sum(b.downloadCount) as totalDownloads " +
           "RETURN t.name as tagName, " +
           "       bookCount, " +
           "       totalDownloads, " +
           "       CASE WHEN bookCount > 0 THEN totalDownloads / bookCount ELSE 0 END as avgDownloadsPerBook " +
           "ORDER BY totalDownloads DESC")
    List<TagStats> getTagStatistics();
    
    // Interface pour les statistiques
    interface TagStats {
        String getTagName();
        Long getBookCount();
        Long getTotalDownloads();
        Double getAvgDownloadsPerBook();
    }
}