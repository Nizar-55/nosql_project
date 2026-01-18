package com.library.service;

import com.library.model.Book;
import com.library.model.Category;
import com.library.model.DownloadHistory;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.DownloadHistoryRepository;
import com.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service d'analyse et de statistiques pour la plateforme
 * Fournit des insights sur l'utilisation, les tendances et les performances
 */
@Service
public class AnalyticsService {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private DownloadHistoryRepository downloadHistoryRepository;
    
    /**
     * Obtient les statistiques générales de la plateforme
     */
    public PlatformStats getPlatformStats() {
        logger.info("Génération des statistiques générales de la plateforme");
        
        PlatformStats stats = new PlatformStats();
        
        // Statistiques de base
        stats.setTotalBooks(bookRepository.countAvailableBooks());
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCategories(categoryRepository.count());
        stats.setTotalDownloads(downloadHistoryRepository.count());
        
        // Statistiques temporelles
        ZonedDateTime lastWeek = ZonedDateTime.now().minus(7, ChronoUnit.DAYS);
        ZonedDateTime lastMonth = ZonedDateTime.now().minus(30, ChronoUnit.DAYS);
        
        stats.setDownloadsLastWeek(downloadHistoryRepository.findRecentDownloadsPaginated(lastWeek, 0, Integer.MAX_VALUE).size());
        stats.setDownloadsLastMonth(downloadHistoryRepository.findRecentDownloadsPaginated(lastMonth, 0, Integer.MAX_VALUE).size());
        
        // Livres les plus populaires
        int topLimit = 10;
        stats.setMostDownloadedBooks(bookRepository.findMostDownloadedPaginated(0, topLimit));
        stats.setMostFavoritedBooks(bookRepository.findMostFavoritedPaginated(0, topLimit));
        
        return stats;
    }
    
    /**
     * Obtient les statistiques d'utilisation par catégorie
     */
    public List<CategoryStats> getCategoryStats() {
        logger.info("Génération des statistiques par catégorie");
        
        List<Category> categories = categoryRepository.findAll();
        
        return categories.stream()
            .map(this::calculateCategoryStats)
            .sorted((c1, c2) -> Long.compare(c2.getTotalDownloads(), c1.getTotalDownloads()))
            .collect(Collectors.toList());
    }
    
    /**
     * Obtient les tendances de téléchargement sur une période
     */
    public List<DownloadTrend> getDownloadTrends(int days) {
        logger.info("Génération des tendances de téléchargement sur {} jours", days);
        
        ZonedDateTime startDate = ZonedDateTime.now().minus(days, ChronoUnit.DAYS);
        List<DownloadHistoryRepository.DailyDownloadStatsResult> rawData = downloadHistoryRepository.getDownloadStatsByDay(startDate);
        
        return rawData.stream()
            .map(row -> new DownloadTrend(
                java.sql.Date.valueOf(row.getDownloadDate()), 
                row.getDailyCount()
            ))
            .collect(Collectors.toList());
    }
    
    /**
     * Obtient les auteurs les plus populaires
     */
    public List<AuthorStats> getPopularAuthors(int limit) {
        logger.info("Génération des statistiques des auteurs populaires (top {})", limit);
        
        List<BookRepository.AuthorPopularityStats> rawData = bookRepository.findMostPopularAuthorsPaginated(0, limit);
        
        return rawData.stream()
            .map(row -> new AuthorStats(
                row.getAuthor(),           // author name
                row.getBookCount(),        // book count
                row.getTotalDownloads()    // total downloads
            ))
            .collect(Collectors.toList());
    }
    
    /**
     * Obtient les utilisateurs les plus actifs
     */
    public List<UserActivityStats> getMostActiveUsers(int days, int limit) {
        logger.info("Génération des statistiques des utilisateurs actifs sur {} jours (top {})", days, limit);
        
        ZonedDateTime startDate = ZonedDateTime.now().minus(days, ChronoUnit.DAYS);
        
        List<DownloadHistoryRepository.UserActivityResult> rawData = downloadHistoryRepository.findMostActiveUsersInPeriodPaginated(startDate, 0, limit);
        
        return rawData.stream()
            .map(row -> {
                User user = row.getUser();
                Long downloadCount = row.getDownloadCount();
                return new UserActivityStats(
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    downloadCount
                );
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Analyse les patterns de lecture d'un utilisateur
     */
    public UserReadingPattern analyzeUserReadingPattern(Long userId) {
        logger.info("Analyse des patterns de lecture pour l'utilisateur {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return null;
        }
        
        User user = userOpt.get();
        List<DownloadHistory> downloads = downloadHistoryRepository.findByUserIdOrderByDownloadedAtDesc(userId);
        
        UserReadingPattern pattern = new UserReadingPattern();
        pattern.setUserId(userId);
        pattern.setUsername(user.getUsername());
        pattern.setTotalDownloads(downloads.size());
        pattern.setTotalFavorites(user.getFavorites().size());
        
        // Analyser les préférences de catégories
        Map<String, Long> categoryPreferences = new HashMap<>();
        Map<String, Long> authorPreferences = new HashMap<>();
        
        // Analyser les favoris (poids plus fort)
        for (Book favorite : user.getFavorites()) {
            categoryPreferences.merge(favorite.getCategory().getName(), 2L, Long::sum);
            authorPreferences.merge(favorite.getAuthor(), 2L, Long::sum);
        }
        
        // Analyser les téléchargements
        for (DownloadHistory download : downloads) {
            Book book = download.getBook();
            categoryPreferences.merge(book.getCategory().getName(), 1L, Long::sum);
            authorPreferences.merge(book.getAuthor(), 1L, Long::sum);
        }
        
        pattern.setPreferredCategories(categoryPreferences);
        pattern.setPreferredAuthors(authorPreferences);
        
        // Analyser l'activité temporelle
        if (!downloads.isEmpty()) {
            ZonedDateTime firstDownload = downloads.get(downloads.size() - 1).getDownloadedAt();
            ZonedDateTime lastDownload = downloads.get(0).getDownloadedAt();
            
            long daysBetween = ChronoUnit.DAYS.between(firstDownload, lastDownload);
            pattern.setDaysSinceFirstActivity(daysBetween);
            
            // Calculer la fréquence moyenne
            if (daysBetween > 0) {
                pattern.setAverageDownloadsPerWeek((double) downloads.size() / (daysBetween / 7.0));
            }
        }
        
        return pattern;
    }
    
    /**
     * Calcule les statistiques pour une catégorie donnée
     */
    private CategoryStats calculateCategoryStats(Category category) {
        CategoryStats stats = new CategoryStats();
        stats.setCategoryId(category.getId());
        stats.setCategoryName(category.getName());
        
        // Compter les livres dans cette catégorie
        long bookCount = bookRepository.countByCategoryId(category.getId());
        stats.setBookCount(bookCount);
        
        // Calculer les téléchargements totaux pour cette catégorie
        List<Book> categoryBooks = bookRepository.findByCategoryIdPaginated(category.getId(), 0, Integer.MAX_VALUE);
        long totalDownloads = categoryBooks.stream()
            .mapToLong(Book::getDownloadCount)
            .sum();
        
        stats.setTotalDownloads(totalDownloads);
        
        // Calculer la moyenne des téléchargements par livre
        stats.setAverageDownloadsPerBook(bookCount > 0 ? (double) totalDownloads / bookCount : 0.0);
        
        return stats;
    }
    
    // Classes internes pour les DTOs de statistiques
    
    public static class PlatformStats {
        private Long totalBooks;
        private Long totalUsers;
        private Long totalCategories;
        private Long totalDownloads;
        private Integer downloadsLastWeek;
        private Integer downloadsLastMonth;
        private List<Book> mostDownloadedBooks;
        private List<Book> mostFavoritedBooks;
        
        // Getters et Setters
        public Long getTotalBooks() { return totalBooks; }
        public void setTotalBooks(Long totalBooks) { this.totalBooks = totalBooks; }
        
        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        
        public Long getTotalCategories() { return totalCategories; }
        public void setTotalCategories(Long totalCategories) { this.totalCategories = totalCategories; }
        
        public Long getTotalDownloads() { return totalDownloads; }
        public void setTotalDownloads(Long totalDownloads) { this.totalDownloads = totalDownloads; }
        
        public Integer getDownloadsLastWeek() { return downloadsLastWeek; }
        public void setDownloadsLastWeek(Integer downloadsLastWeek) { this.downloadsLastWeek = downloadsLastWeek; }
        
        public Integer getDownloadsLastMonth() { return downloadsLastMonth; }
        public void setDownloadsLastMonth(Integer downloadsLastMonth) { this.downloadsLastMonth = downloadsLastMonth; }
        
        public List<Book> getMostDownloadedBooks() { return mostDownloadedBooks; }
        public void setMostDownloadedBooks(List<Book> mostDownloadedBooks) { this.mostDownloadedBooks = mostDownloadedBooks; }
        
        public List<Book> getMostFavoritedBooks() { return mostFavoritedBooks; }
        public void setMostFavoritedBooks(List<Book> mostFavoritedBooks) { this.mostFavoritedBooks = mostFavoritedBooks; }
    }
    
    public static class CategoryStats {
        private Long categoryId;
        private String categoryName;
        private Long bookCount;
        private Long totalDownloads;
        private Double averageDownloadsPerBook;
        
        // Getters et Setters
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        
        public Long getBookCount() { return bookCount; }
        public void setBookCount(Long bookCount) { this.bookCount = bookCount; }
        
        public Long getTotalDownloads() { return totalDownloads; }
        public void setTotalDownloads(Long totalDownloads) { this.totalDownloads = totalDownloads; }
        
        public Double getAverageDownloadsPerBook() { return averageDownloadsPerBook; }
        public void setAverageDownloadsPerBook(Double averageDownloadsPerBook) { this.averageDownloadsPerBook = averageDownloadsPerBook; }
    }
    
    public static class DownloadTrend {
        private java.sql.Date date;
        private Long downloadCount;
        
        public DownloadTrend(java.sql.Date date, Long downloadCount) {
            this.date = date;
            this.downloadCount = downloadCount;
        }
        
        // Getters et Setters
        public java.sql.Date getDate() { return date; }
        public void setDate(java.sql.Date date) { this.date = date; }
        
        public Long getDownloadCount() { return downloadCount; }
        public void setDownloadCount(Long downloadCount) { this.downloadCount = downloadCount; }
    }
    
    public static class AuthorStats {
        private String authorName;
        private Long bookCount;
        private Long totalDownloads;
        
        public AuthorStats(String authorName, Long bookCount, Long totalDownloads) {
            this.authorName = authorName;
            this.bookCount = bookCount;
            this.totalDownloads = totalDownloads;
        }
        
        // Getters et Setters
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        
        public Long getBookCount() { return bookCount; }
        public void setBookCount(Long bookCount) { this.bookCount = bookCount; }
        
        public Long getTotalDownloads() { return totalDownloads; }
        public void setTotalDownloads(Long totalDownloads) { this.totalDownloads = totalDownloads; }
    }
    
    public static class UserActivityStats {
        private Long userId;
        private String username;
        private String fullName;
        private Long downloadCount;
        
        public UserActivityStats(Long userId, String username, String fullName, Long downloadCount) {
            this.userId = userId;
            this.username = username;
            this.fullName = fullName;
            this.downloadCount = downloadCount;
        }
        
        // Getters et Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        
        public Long getDownloadCount() { return downloadCount; }
        public void setDownloadCount(Long downloadCount) { this.downloadCount = downloadCount; }
    }
    
    public static class UserReadingPattern {
        private Long userId;
        private String username;
        private Integer totalDownloads;
        private Integer totalFavorites;
        private Map<String, Long> preferredCategories;
        private Map<String, Long> preferredAuthors;
        private Long daysSinceFirstActivity;
        private Double averageDownloadsPerWeek;
        
        // Getters et Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public Integer getTotalDownloads() { return totalDownloads; }
        public void setTotalDownloads(Integer totalDownloads) { this.totalDownloads = totalDownloads; }
        
        public Integer getTotalFavorites() { return totalFavorites; }
        public void setTotalFavorites(Integer totalFavorites) { this.totalFavorites = totalFavorites; }
        
        public Map<String, Long> getPreferredCategories() { return preferredCategories; }
        public void setPreferredCategories(Map<String, Long> preferredCategories) { this.preferredCategories = preferredCategories; }
        
        public Map<String, Long> getPreferredAuthors() { return preferredAuthors; }
        public void setPreferredAuthors(Map<String, Long> preferredAuthors) { this.preferredAuthors = preferredAuthors; }
        
        public Long getDaysSinceFirstActivity() { return daysSinceFirstActivity; }
        public void setDaysSinceFirstActivity(Long daysSinceFirstActivity) { this.daysSinceFirstActivity = daysSinceFirstActivity; }
        
        public Double getAverageDownloadsPerWeek() { return averageDownloadsPerWeek; }
        public void setAverageDownloadsPerWeek(Double averageDownloadsPerWeek) { this.averageDownloadsPerWeek = averageDownloadsPerWeek; }
    }
}