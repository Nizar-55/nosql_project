package com.library.service;

import com.library.model.Book;
import com.library.model.Category;
import com.library.model.DownloadHistory;
import com.library.model.Tag;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.DownloadHistoryRepository;
import com.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de recommandation avancé utilisant plusieurs algorithmes :
 * 1. Content-Based Filtering (filtrage basé sur le contenu)
 * 2. User Behavior Analysis (analyse comportementale)
 * 3. Hybrid Approach (approche hybride)
 * 
 * Formules utilisées :
 * - Score de similarité de contenu : Jaccard Similarity pour les tags + pondération catégorie
 * - Score comportemental : basé sur l'historique des téléchargements et favoris
 * - Score de popularité : combinaison download_count et favorite_count avec décroissance temporelle
 * - Score final : moyenne pondérée des trois scores ci-dessus
 */
@Service
public class RecommendationService {
    
    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);
    
    // Poids pour le calcul du score final
    private static final double CONTENT_WEIGHT = 0.4;      // 40% - similarité de contenu
    private static final double BEHAVIOR_WEIGHT = 0.35;    // 35% - comportement utilisateur
    private static final double POPULARITY_WEIGHT = 0.25;  // 25% - popularité globale
    
    // Paramètres pour l'analyse comportementale
    private static final int RECENT_ACTIVITY_DAYS = 30;    // Activité récente (30 jours)
    private static final double FAVORITE_BOOST = 2.0;      // Multiplicateur pour les favoris
    private static final double DOWNLOAD_BOOST = 1.5;      // Multiplicateur pour les téléchargements
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DownloadHistoryRepository downloadHistoryRepository;
    
    /**
     * Génère des recommandations personnalisées pour un utilisateur
     * 
     * @param userId ID de l'utilisateur
     * @param limit Nombre maximum de recommandations
     * @return Liste des livres recommandés avec leur score
     */
    public List<RecommendationResult> getPersonalizedRecommendations(Long userId, int limit) {
        logger.info("Génération de recommandations personnalisées pour l'utilisateur {}", userId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            logger.warn("Utilisateur {} non trouvé", userId);
            return getFallbackRecommendations(limit);
        }
        
        User user = userOpt.get();
        
        // Récupérer tous les livres disponibles (sauf ceux déjà dans les favoris)
        List<Book> candidateBooks = getAllCandidateBooks(user);
        
        if (candidateBooks.isEmpty()) {
            logger.info("Aucun livre candidat trouvé pour l'utilisateur {}", userId);
            return getFallbackRecommendations(limit);
        }
        
        // Calculer les scores pour chaque livre candidat
        List<RecommendationResult> recommendations = candidateBooks.stream()
            .map(book -> calculateRecommendationScore(user, book))
            .sorted((r1, r2) -> Double.compare(r2.getScore(), r1.getScore()))
            .limit(limit)
            .collect(Collectors.toList());
        
        logger.info("Généré {} recommandations pour l'utilisateur {}", recommendations.size(), userId);
        return recommendations;
    }
    
    /**
     * Recommandations basées sur une catégorie spécifique
     */
    public List<RecommendationResult> getCategoryBasedRecommendations(Long userId, Long categoryId, int limit) {
        logger.info("Génération de recommandations par catégorie {} pour l'utilisateur {}", categoryId, userId);
        
        int skip = 0;
        List<Book> booksInCategory = bookRepository.findByCategoryIdPaginated(categoryId, skip, limit * 2);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return booksInCategory.stream()
                .limit(limit)
                .map(book -> new RecommendationResult(book, 0.5, "Catégorie populaire"))
                .collect(Collectors.toList());
        }
        
        User user = userOpt.get();
        Set<Long> userFavoriteIds = user.getFavorites().stream()
            .map(Book::getId)
            .collect(Collectors.toSet());
        
        return booksInCategory.stream()
            .filter(book -> !userFavoriteIds.contains(book.getId()))
            .map(book -> calculateRecommendationScore(user, book))
            .sorted((r1, r2) -> Double.compare(r2.getScore(), r1.getScore()))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Recommandations basées sur les livres similaires à un livre donné
     */
    public List<RecommendationResult> getSimilarBooks(Long bookId, Long userId, int limit) {
        logger.info("Recherche de livres similaires au livre {} pour l'utilisateur {}", bookId, userId);
        
        Optional<Book> targetBookOpt = bookRepository.findById(bookId);
        if (targetBookOpt.isEmpty()) {
            return Collections.emptyList();
        }
        
        Book targetBook = targetBookOpt.get();
        List<Book> allBooks = bookRepository.findAll();
        
        Optional<User> userOpt = userRepository.findById(userId);
        Set<Long> userFavoriteIds = userOpt.map(user -> 
            user.getFavorites().stream().map(Book::getId).collect(Collectors.toSet())
        ).orElse(Collections.emptySet());
        
        return allBooks.stream()
            .filter(book -> !book.getId().equals(bookId))
            .filter(book -> book.getAvailable())
            .filter(book -> !userFavoriteIds.contains(book.getId()))
            .map(book -> {
                double similarity = calculateContentSimilarity(targetBook, book);
                return new RecommendationResult(book, similarity, "Livre similaire");
            })
            .sorted((r1, r2) -> Double.compare(r2.getScore(), r1.getScore()))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Recommandations tendances (livres populaires récemment)
     */
    public List<RecommendationResult> getTrendingRecommendations(int limit) {
        logger.info("Génération des recommandations tendances");
        
        int skip = 0;
        
        // Récupérer les livres les plus téléchargés récemment
        List<Book> recentlyPopular = downloadHistoryRepository
            .findBooksDownloadedAfterPaginated(ZonedDateTime.now().minus(7, ChronoUnit.DAYS), skip, limit * 2);
        
        // Calculer un score de tendance basé sur l'activité récente
        return recentlyPopular.stream()
            .map(book -> {
                double trendScore = calculateTrendScore(book);
                return new RecommendationResult(book, trendScore, "Tendance");
            })
            .sorted((r1, r2) -> Double.compare(r2.getScore(), r1.getScore()))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    /**
     * Calcule le score de recommandation pour un livre donné et un utilisateur
     */
    private RecommendationResult calculateRecommendationScore(User user, Book book) {
        // 1. Score de similarité de contenu
        double contentScore = calculateContentScore(user, book);
        
        // 2. Score comportemental
        double behaviorScore = calculateBehaviorScore(user, book);
        
        // 3. Score de popularité
        double popularityScore = calculatePopularityScore(book);
        
        // Score final pondéré
        double finalScore = (contentScore * CONTENT_WEIGHT) + 
                           (behaviorScore * BEHAVIOR_WEIGHT) + 
                           (popularityScore * POPULARITY_WEIGHT);
        
        // Normaliser le score entre 0 et 1
        finalScore = Math.min(1.0, Math.max(0.0, finalScore));
        
        String reason = buildRecommendationReason(contentScore, behaviorScore, popularityScore);
        
        return new RecommendationResult(book, finalScore, reason);
    }
    
    /**
     * Calcule le score de similarité de contenu entre les préférences utilisateur et un livre
     * Utilise la similarité de Jaccard pour les tags + pondération catégorie
     */
    private double calculateContentScore(User user, Book book) {
        Set<Book> userFavorites = user.getFavorites();
        if (userFavorites.isEmpty()) {
            return 0.3; // Score neutre si pas de favoris
        }
        
        double maxSimilarity = 0.0;
        
        for (Book favorite : userFavorites) {
            double similarity = calculateContentSimilarity(favorite, book);
            maxSimilarity = Math.max(maxSimilarity, similarity);
        }
        
        return maxSimilarity;
    }
    
    /**
     * Calcule la similarité de contenu entre deux livres
     */
    private double calculateContentSimilarity(Book book1, Book book2) {
        double categoryScore = 0.0;
        double tagScore = 0.0;
        double authorScore = 0.0;
        
        // Similarité de catégorie (poids fort)
        if (book1.getCategory().getId().equals(book2.getCategory().getId())) {
            categoryScore = 1.0;
        }
        
        // Similarité d'auteur
        if (book1.getAuthor().equalsIgnoreCase(book2.getAuthor())) {
            authorScore = 1.0;
        }
        
        // Similarité de tags (Jaccard Similarity)
        Set<String> tags1 = book1.getTags().stream()
            .map(Tag::getName)
            .collect(Collectors.toSet());
        Set<String> tags2 = book2.getTags().stream()
            .map(Tag::getName)
            .collect(Collectors.toSet());
        
        if (!tags1.isEmpty() || !tags2.isEmpty()) {
            Set<String> intersection = new HashSet<>(tags1);
            intersection.retainAll(tags2);
            
            Set<String> union = new HashSet<>(tags1);
            union.addAll(tags2);
            
            tagScore = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
        }
        
        // Score final pondéré
        return (categoryScore * 0.5) + (tagScore * 0.3) + (authorScore * 0.2);
    }
    
    /**
     * Calcule le score comportemental basé sur l'historique utilisateur
     */
    private double calculateBehaviorScore(User user, Book book) {
        // Analyser les patterns de téléchargement de l'utilisateur
        List<DownloadHistory> userDownloads = downloadHistoryRepository
            .findByUserIdOrderByDownloadedAtDesc(user.getId());
        
        if (userDownloads.isEmpty()) {
            return 0.2; // Score faible si pas d'historique
        }
        
        // Analyser les catégories et tags préférés
        Map<Long, Integer> categoryPreferences = new HashMap<>();
        Map<String, Integer> tagPreferences = new HashMap<>();
        Map<String, Integer> authorPreferences = new HashMap<>();
        
        // Analyser les favoris (poids plus fort)
        for (Book favorite : user.getFavorites()) {
            categoryPreferences.merge(favorite.getCategory().getId(), 2, Integer::sum);
            authorPreferences.merge(favorite.getAuthor(), 2, Integer::sum);
            for (Tag tag : favorite.getTags()) {
                tagPreferences.merge(tag.getName(), 2, Integer::sum);
            }
        }
        
        // Analyser l'historique de téléchargement (poids moyen)
        for (DownloadHistory download : userDownloads) {
            Book downloadedBook = download.getBook();
            categoryPreferences.merge(downloadedBook.getCategory().getId(), 1, Integer::sum);
            authorPreferences.merge(downloadedBook.getAuthor(), 1, Integer::sum);
            for (Tag tag : downloadedBook.getTags()) {
                tagPreferences.merge(tag.getName(), 1, Integer::sum);
            }
        }
        
        // Calculer le score pour le livre candidat
        double score = 0.0;
        
        // Score catégorie
        Integer categoryPref = categoryPreferences.get(book.getCategory().getId());
        if (categoryPref != null) {
            score += Math.min(1.0, categoryPref / 10.0) * 0.4;
        }
        
        // Score auteur
        Integer authorPref = authorPreferences.get(book.getAuthor());
        if (authorPref != null) {
            score += Math.min(1.0, authorPref / 5.0) * 0.3;
        }
        
        // Score tags
        double tagScore = 0.0;
        int tagCount = 0;
        for (Tag tag : book.getTags()) {
            Integer tagPref = tagPreferences.get(tag.getName());
            if (tagPref != null) {
                tagScore += Math.min(1.0, tagPref / 5.0);
                tagCount++;
            }
        }
        if (tagCount > 0) {
            score += (tagScore / tagCount) * 0.3;
        }
        
        return Math.min(1.0, score);
    }
    
    /**
     * Calcule le score de popularité d'un livre
     */
    private double calculatePopularityScore(Book book) {
        // Normaliser les compteurs (supposons des valeurs max raisonnables)
        double downloadScore = Math.min(1.0, book.getDownloadCount() / 1000.0);
        double favoriteScore = Math.min(1.0, book.getFavoriteCount() / 100.0);
        
        // Facteur de fraîcheur (les nouveaux livres ont un petit boost)
        double freshnessScore = 0.0;
        if (book.getCreatedAt() != null) {
            long daysOld = ChronoUnit.DAYS.between(book.getCreatedAt(), ZonedDateTime.now());
            if (daysOld < 30) {
                freshnessScore = 0.2 * (30 - daysOld) / 30.0;
            }
        }
        
        return (downloadScore * 0.4) + (favoriteScore * 0.4) + (freshnessScore * 0.2);
    }
    
    /**
     * Calcule le score de tendance pour les recommandations trending
     */
    private double calculateTrendScore(Book book) {
        // Récupérer l'activité récente (7 derniers jours)
        ZonedDateTime weekAgo = ZonedDateTime.now().minus(7, ChronoUnit.DAYS);
        
        long recentDownloads = downloadHistoryRepository
            .countByBookIdAndDownloadedAtAfter(book.getId(), weekAgo);
        
        // Score basé sur l'activité récente vs activité totale
        double recentActivity = Math.min(1.0, recentDownloads / 50.0); // Max 50 téléchargements/semaine
        double totalPopularity = calculatePopularityScore(book);
        
        return (recentActivity * 0.7) + (totalPopularity * 0.3);
    }
    
    /**
     * Construit une explication pour la recommandation
     */
    private String buildRecommendationReason(double contentScore, double behaviorScore, double popularityScore) {
        List<String> reasons = new ArrayList<>();
        
        if (contentScore > 0.6) {
            reasons.add("Contenu similaire à vos favoris");
        }
        if (behaviorScore > 0.6) {
            reasons.add("Correspond à vos habitudes de lecture");
        }
        if (popularityScore > 0.7) {
            reasons.add("Très populaire");
        }
        
        if (reasons.isEmpty()) {
            return "Découverte suggérée";
        }
        
        return String.join(" • ", reasons);
    }
    
    /**
     * Récupère tous les livres candidats (excluant les favoris de l'utilisateur)
     */
    private List<Book> getAllCandidateBooks(User user) {
        Set<Long> favoriteIds = user.getFavorites().stream()
            .map(Book::getId)
            .collect(Collectors.toSet());
        
        return bookRepository.findAllAvailable().stream()
            .filter(book -> !favoriteIds.contains(book.getId()))
            .collect(Collectors.toList());
    }
    
    /**
     * Recommandations de fallback quand l'utilisateur n'a pas d'historique
     */
    private List<RecommendationResult> getFallbackRecommendations(int limit) {
        logger.info("Génération de recommandations de fallback");
        
        List<Book> popularBooks = bookRepository.findMostDownloadedPaginated(0, limit);
        
        return popularBooks.stream()
            .map(book -> new RecommendationResult(book, 0.5, "Populaire"))
            .collect(Collectors.toList());
    }
    
    /**
     * Classe interne pour représenter un résultat de recommandation
     */
    public static class RecommendationResult {
        private final Book book;
        private final double score;
        private final String reason;
        
        public RecommendationResult(Book book, double score, String reason) {
            this.book = book;
            this.score = score;
            this.reason = reason;
        }
        
        public Book getBook() { return book; }
        public double getScore() { return score; }
        public String getReason() { return reason; }
        
        @Override
        public String toString() {
            return String.format("RecommendationResult{book='%s', score=%.3f, reason='%s'}", 
                book.getTitle(), score, reason);
        }
    }
}