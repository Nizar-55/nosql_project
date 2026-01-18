package com.library.repository;

import com.library.model.DownloadHistory;
import com.library.model.User;
import com.library.model.Book;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Repository Neo4j pour l'historique des téléchargements
 */
@Repository
public interface DownloadHistoryRepository extends Neo4jRepository<DownloadHistory, Long> {
    
    // Historique par utilisateur - INCLUT ceux sans livres
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE elementId(u) = $userId " +
           "OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book) " +
           "OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category) " +
           "RETURN dh, b, c ORDER BY dh.downloadedAt DESC")
    List<DownloadHistory> findByUserId(@Param("userId") Long userId);
    
    // Historique par livre
    @Query("MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book) " +
           "WHERE elementId(b) = $bookId " +
           "OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User) " +
           "RETURN dh, b, u ORDER BY dh.downloadedAt DESC")
    List<DownloadHistory> findByBookId(@Param("bookId") Long bookId);
    
    // Historique par utilisateur avec pagination - INCLUT ceux sans livres
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE elementId(u) = $userId " +
           "OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book) " +
           "OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category) " +
           "RETURN dh, b, c ORDER BY dh.downloadedAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<DownloadHistory> findByUserIdWithPagination(
        @Param("userId") Long userId, 
        @Param("skip") int skip, 
        @Param("limit") int limit
    );
    
    // Téléchargements récents
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt >= $since " +
           "RETURN dh ORDER BY dh.downloadedAt DESC LIMIT $limit")
    List<DownloadHistory> findRecentDownloads(@Param("since") ZonedDateTime since, @Param("limit") int limit);
    
    // Téléchargements par période
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt >= $startDate AND dh.downloadedAt <= $endDate " +
           "RETURN dh ORDER BY dh.downloadedAt DESC")
    List<DownloadHistory> findByDateRange(
        @Param("startDate") ZonedDateTime startDate, 
        @Param("endDate") ZonedDateTime endDate
    );
    
    // Compter les téléchargements par utilisateur - INCLUT ceux sans livres
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE elementId(u) = $userId " +
           "RETURN count(dh)")
    Long countByUserId(@Param("userId") Long userId);
    
    // Compter les téléchargements par livre
    @Query("MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book) " +
           "WHERE elementId(b) = $bookId " +
           "RETURN count(dh)")
    Long countByBookId(@Param("bookId") Long bookId);
    
    // Vérifier si un utilisateur a téléchargé un livre
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User), " +
           "      (dh)-[:OF_BOOK]->(b:Book) " +
           "WHERE elementId(u) = $userId AND elementId(b) = $bookId " +
           "RETURN count(dh) > 0")
    boolean existsByUserIdAndBookId(@Param("userId") Long userId, @Param("bookId") Long bookId);
    
    // Livres les plus téléchargés
    @Query("MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book) " +
           "WITH b, count(dh) as downloadCount " +
           "RETURN b ORDER BY downloadCount DESC LIMIT $limit")
    List<Book> findMostDownloadedBooks(@Param("limit") int limit);
    
    // Utilisateurs les plus actifs
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WITH u, count(dh) as downloadCount " +
           "RETURN u ORDER BY downloadCount DESC LIMIT $limit")
    List<User> findMostActiveUsers(@Param("limit") int limit);
    
    // Statistiques de téléchargement par jour
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt >= $startDate " +
           "WITH date(dh.downloadedAt) as downloadDate, count(dh) as dailyCount " +
           "RETURN downloadDate, dailyCount ORDER BY downloadDate DESC")
    List<DailyDownloadStats> getDailyDownloadStats(@Param("startDate") ZonedDateTime startDate);
    
    // Supprimer l'historique d'un utilisateur
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE elementId(u) = $userId " +
           "DETACH DELETE dh")
    void deleteByUserId(@Param("userId") Long userId);
    
    // Supprimer l'historique ancien
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt < $beforeDate " +
           "DETACH DELETE dh")
    void deleteOldDownloads(@Param("beforeDate") ZonedDateTime beforeDate);
    
    // Historique par utilisateur ordonné par date
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE elementId(u) = $userId " +
           "RETURN dh ORDER BY dh.downloadedAt DESC")
    List<DownloadHistory> findByUserIdOrderByDownloadedAtDesc(@Param("userId") Long userId);
    
    // Téléchargements récents avec pagination
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt >= $since " +
           "RETURN dh ORDER BY dh.downloadedAt DESC " +
           "SKIP $skip LIMIT $limit")
    List<DownloadHistory> findRecentDownloadsPaginated(@Param("since") ZonedDateTime since, @Param("skip") int skip, @Param("limit") int limit);
    
    // Livres téléchargés après une date avec pagination
    @Query("MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book) " +
           "WHERE dh.downloadedAt >= $since " +
           "WITH b, count(dh) as downloadCount " +
           "RETURN b ORDER BY downloadCount DESC " +
           "SKIP $skip LIMIT $limit")
    List<Book> findBooksDownloadedAfterPaginated(@Param("since") ZonedDateTime since, @Param("skip") int skip, @Param("limit") int limit);
    
    // Compter téléchargements d'un livre après une date
    @Query("MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book) " +
           "WHERE elementId(b) = $bookId AND dh.downloadedAt >= $since " +
           "RETURN count(dh)")
    Long countByBookIdAndDownloadedAtAfter(@Param("bookId") Long bookId, @Param("since") ZonedDateTime since);
    
    // Utilisateurs les plus actifs dans une période avec pagination
    @Query("MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User) " +
           "WHERE dh.downloadedAt >= $since " +
           "WITH u, count(dh) as downloadCount " +
           "RETURN u, downloadCount ORDER BY downloadCount DESC " +
           "SKIP $skip LIMIT $limit")
    List<UserActivityResult> findMostActiveUsersInPeriodPaginated(@Param("since") ZonedDateTime since, @Param("skip") int skip, @Param("limit") int limit);
    
    // Statistiques de téléchargement par jour
    @Query("MATCH (dh:DownloadHistory) " +
           "WHERE dh.downloadedAt >= $startDate " +
           "WITH date(dh.downloadedAt) as downloadDate, count(dh) as dailyCount " +
           "RETURN toString(downloadDate) as downloadDate, dailyCount ORDER BY downloadDate DESC")
    List<DailyDownloadStatsResult> getDownloadStatsByDay(@Param("startDate") ZonedDateTime startDate);
    
    // Interface pour les résultats d'activité utilisateur
    interface UserActivityResult {
        User getUser();
        Long getDownloadCount();
    }
    
    // Interface pour les statistiques quotidiennes
    interface DailyDownloadStats {
        String getDownloadDate();
        Long getDailyCount();
    }
    
    // Interface pour les résultats de statistiques quotidiennes
    interface DailyDownloadStatsResult {
        String getDownloadDate();
        Long getDailyCount();
    }
}