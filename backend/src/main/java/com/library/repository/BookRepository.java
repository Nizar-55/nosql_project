package com.library.repository;

import com.library.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository Neo4j pour les livres
 */
@Repository
public interface BookRepository extends Neo4jRepository<Book, Long> {
    
    // Recherche par titre (insensible à la casse)
    @Query("MATCH (b:Book) WHERE toLower(b.title) CONTAINS toLower($title) RETURN b")
    List<Book> findByTitleContainingIgnoreCase(@Param("title") String title);
    
    // Recherche par auteur (insensible à la casse)
    @Query("MATCH (b:Book) WHERE toLower(b.author) CONTAINS toLower($author) RETURN b")
    List<Book> findByAuthorContainingIgnoreCase(@Param("author") String author);
    
    // Recherche par catégorie
    @Query("MATCH (b:Book)-[:BELONGS_TO]->(c:Category) WHERE c.name = $categoryName RETURN b")
    List<Book> findByCategoryName(@Param("categoryName") String categoryName);
    
    // Recherche par catégorie ID
    @Query("MATCH (b:Book)-[:BELONGS_TO]->(c:Category) WHERE c.id = $categoryId RETURN b")
    List<Book> findByCategoryId(@Param("categoryId") Long categoryId);
    
    // Recherche par tag
    @Query("MATCH (b:Book)-[:HAS_TAG]->(t:Tag) WHERE t.name = $tagName RETURN b")
    List<Book> findByTagName(@Param("tagName") String tagName);
    
    // Recherche par disponibilité
    @Query("MATCH (b:Book) WHERE b.available = $available RETURN b")
    List<Book> findByAvailable(@Param("available") Boolean available);
    
    // Recherche par langue
    @Query("MATCH (b:Book) WHERE b.language = $language RETURN b")
    List<Book> findByLanguage(@Param("language") String language);
    
    // Recherche par année de publication
    @Query("MATCH (b:Book) WHERE b.publicationYear = $year RETURN b")
    List<Book> findByPublicationYear(@Param("year") Integer year);
    
    // Recherche par ISBN
    Optional<Book> findByIsbn(String isbn);
    
    // Livres les plus téléchargés
    @Query("MATCH (b:Book) WHERE b.available = true RETURN b ORDER BY b.downloadCount DESC LIMIT $limit")
    List<Book> findTopByDownloadCount(@Param("limit") int limit);
    
    // Livres les plus favoris
    @Query("MATCH (b:Book) WHERE b.available = true RETURN b ORDER BY b.favoriteCount DESC LIMIT $limit")
    List<Book> findTopByFavoriteCount(@Param("limit") int limit);
    
    // Livres récents
    @Query("MATCH (b:Book) WHERE b.available = true RETURN b ORDER BY b.createdAt DESC LIMIT $limit")
    List<Book> findRecentBooks(@Param("limit") int limit);
    
    // Recherche textuelle complète
    @Query("MATCH (b:Book) " +
           "WHERE toLower(b.title) CONTAINS toLower($query) " +
           "   OR toLower(b.author) CONTAINS toLower($query) " +
           "   OR toLower(b.description) CONTAINS toLower($query) " +
           "RETURN b")
    List<Book> searchBooks(@Param("query") String query);
    
    // Recherche avancée SIMPLIFIÉE - seulement catégorie et tags
    @Query("MATCH (b:Book) " +
           "WHERE b.available = true " +
           "  AND ($categoryId IS NULL OR EXISTS { " +
           "    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = $categoryId " +
           "  }) " +
           "  AND ($tags IS NULL OR EXISTS { " +
           "    MATCH (b)-[:HAS_TAG]->(t:Tag) WHERE t.name IN split($tags, ',') " +
           "  }) " +
           "RETURN b")
    List<Book> findBooksWithSimpleFilters(
        @Param("categoryId") Long categoryId,
        @Param("tags") String tags
    );
    
    // Obtenir toutes les langues disponibles
    @Query("MATCH (b:Book) WHERE b.available = true AND b.language IS NOT NULL " +
           "RETURN DISTINCT b.language ORDER BY b.language")
    List<String> findAllLanguages();
    
    // Obtenir les années de publication disponibles
    @Query("MATCH (b:Book) WHERE b.available = true AND b.publicationYear IS NOT NULL " +
           "RETURN DISTINCT b.publicationYear ORDER BY b.publicationYear DESC")
    List<Integer> findAllPublicationYears();
    
    // Compter les livres par catégorie
    @Query("MATCH (b:Book)-[:BELONGS_TO]->(c:Category) " +
           "WHERE c.id = $categoryId AND b.available = true " +
           "RETURN count(b)")
    Long countByCategoryId(@Param("categoryId") Long categoryId);
    
    // Livres similaires basés sur la catégorie et les tags
    @Query("MATCH (targetBook:Book)-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(similarBook:Book) " +
           "WHERE targetBook.id = $bookId AND similarBook.id <> $bookId " +
           "  AND similarBook.available = true " +
           "OPTIONAL MATCH (targetBook)-[:HAS_TAG]->(tag:Tag)<-[:HAS_TAG]-(similarBook) " +
           "WITH similarBook, count(tag) as commonTags " +
           "RETURN similarBook ORDER BY commonTags DESC, similarBook.favoriteCount DESC " +
           "LIMIT $limit")
    List<Book> findSimilarBooks(@Param("bookId") Long bookId, @Param("limit") int limit);
    
    // Livres recommandés pour un utilisateur basés sur ses favoris
    @Query("MATCH (user:User)-[:FAVORITES]->(favBook:Book)-[:BELONGS_TO]->(c:Category) " +
           "WHERE user.id = $userId " +
           "MATCH (c)<-[:BELONGS_TO]-(recommendedBook:Book) " +
           "WHERE NOT (user)-[:FAVORITES]->(recommendedBook) " +
           "  AND recommendedBook.available = true " +
           "WITH recommendedBook, count(*) as categoryScore " +
           "OPTIONAL MATCH (user)-[:FAVORITES]->(favBook2:Book)-[:HAS_TAG]->(tag:Tag)<-[:HAS_TAG]-(recommendedBook) " +
           "WITH recommendedBook, categoryScore, count(tag) as tagScore " +
           "RETURN recommendedBook " +
           "ORDER BY (categoryScore * 2 + tagScore) DESC, recommendedBook.favoriteCount DESC " +
           "LIMIT $limit")
    List<Book> findRecommendedBooksForUser(@Param("userId") Long userId, @Param("limit") int limit);
    
    // Statistiques des livres
    @Query("MATCH (b:Book) " +
           "RETURN count(b) as totalBooks, " +
           "       sum(b.downloadCount) as totalDownloads, " +
           "       avg(b.downloadCount) as avgDownloads")
    BookStats getBookStatistics();
    
    // Recherche avec pagination (pour compatibilité avec Page<Book>)
    @Query("MATCH (b:Book) WHERE b.available = true RETURN b ORDER BY b.createdAt DESC")
    List<Book> findAllAvailable();
    
    // Recherche par catégorie avec pagination
    @Query("MATCH (b:Book)-[:BELONGS_TO]->(c:Category) " +
           "WHERE c.id = $categoryId AND b.available = true " +
           "RETURN b ORDER BY b.createdAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<Book> findByCategoryIdPaginated(@Param("categoryId") Long categoryId, @Param("skip") int skip, @Param("limit") int limit);
    
    // Recherche textuelle avec pagination
    @Query("MATCH (b:Book) " +
           "WHERE b.available = true AND (" +
           "  toLower(b.title) CONTAINS toLower($query) " +
           "  OR toLower(b.author) CONTAINS toLower($query) " +
           "  OR toLower(b.description) CONTAINS toLower($query)" +
           ") RETURN b ORDER BY b.createdAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<Book> searchBooksPaginated(@Param("query") String query, @Param("skip") int skip, @Param("limit") int limit);
    
    // Recherche textuelle SIMPLIFIÉE avec filtres catégorie et tags
    @Query("MATCH (b:Book) " +
           "WHERE b.available = true " +
           "  AND (toLower(b.title) CONTAINS toLower($query) " +
           "       OR toLower(b.author) CONTAINS toLower($query) " +
           "       OR toLower(b.description) CONTAINS toLower($query)) " +
           "  AND ($categoryId IS NULL OR EXISTS { " +
           "    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = $categoryId " +
           "  }) " +
           "  AND ($tags IS NULL OR EXISTS { " +
           "    MATCH (b)-[:HAS_TAG]->(t:Tag) WHERE t.name IN split($tags, ',') " +
           "  }) " +
           "RETURN b")
    List<Book> searchBooksWithSimpleFilters(
        @Param("query") String query,
        @Param("categoryId") Long categoryId,
        @Param("tags") String tags
    );
    
    // Livres les plus téléchargés avec pagination
    @Query("MATCH (b:Book) WHERE b.available = true " +
           "RETURN b ORDER BY b.downloadCount DESC " +
           "SKIP $skip LIMIT $limit")
    List<Book> findMostDownloadedPaginated(@Param("skip") int skip, @Param("limit") int limit);
    
    // Livres les plus favoris avec pagination
    @Query("MATCH (b:Book) WHERE b.available = true " +
           "RETURN b ORDER BY b.favoriteCount DESC " +
           "SKIP $skip LIMIT $limit")
    List<Book> findMostFavoritedPaginated(@Param("skip") int skip, @Param("limit") int limit);
    
    // Compter les livres disponibles
    @Query("MATCH (b:Book) WHERE b.available = true RETURN count(b)")
    Long countAvailableBooks();
    
    // Auteurs les plus populaires
    @Query("MATCH (b:Book) WHERE b.available = true " +
           "WITH b.author as author, count(b) as bookCount, sum(b.downloadCount) as totalDownloads " +
           "RETURN author, bookCount, totalDownloads " +
           "ORDER BY totalDownloads DESC " +
           "SKIP $skip LIMIT $limit")
    List<AuthorPopularityStats> findMostPopularAuthorsPaginated(@Param("skip") int skip, @Param("limit") int limit);
    
    // Interface pour les statistiques d'auteurs
    interface AuthorPopularityStats {
        String getAuthor();
        Long getBookCount();
        Long getTotalDownloads();
    }
    
    // Interface pour les statistiques
    interface BookStats {
        Long getTotalBooks();
        Long getTotalDownloads();
        Double getAvgDownloads();
    }
}