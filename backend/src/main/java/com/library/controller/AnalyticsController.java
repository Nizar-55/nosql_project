package com.library.controller;

import com.library.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Contrôleur REST pour les analytics et statistiques (Admin uniquement)
 */
@RestController
@RequestMapping("/analytics")
@Tag(name = "Analytics", description = "API d'analyse et de statistiques (Admin uniquement)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);
    
    @Autowired
    private AnalyticsService analyticsService;
    
    /**
     * Obtient les statistiques générales de la plateforme
     */
    @GetMapping("/platform")
    @Operation(
        summary = "Statistiques générales",
        description = "Obtient les statistiques générales de la plateforme (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<AnalyticsService.PlatformStats> getPlatformStats() {
        try {
            logger.info("Demande de statistiques générales de la plateforme");
            
            AnalyticsService.PlatformStats stats = analyticsService.getPlatformStats();
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques générales", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtient les statistiques par catégorie
     */
    @GetMapping("/categories")
    @Operation(
        summary = "Statistiques par catégorie",
        description = "Obtient les statistiques d'utilisation par catégorie (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques par catégorie récupérées"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getCategoryStats() {
        try {
            logger.info("Demande de statistiques par catégorie");
            
            var stats = analyticsService.getCategoryStats();
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques par catégorie", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtient les tendances de téléchargement
     */
    @GetMapping("/trends/downloads")
    @Operation(
        summary = "Tendances de téléchargement",
        description = "Obtient les tendances de téléchargement sur une période donnée (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tendances récupérées"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getDownloadTrends(
            @Parameter(description = "Nombre de jours à analyser", example = "30")
            @RequestParam(defaultValue = "30") int days) {
        
        try {
            logger.info("Demande de tendances de téléchargement sur {} jours", days);
            
            var trends = analyticsService.getDownloadTrends(days);
            
            return ResponseEntity.ok(trends);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des tendances de téléchargement", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtient les auteurs les plus populaires
     */
    @GetMapping("/authors/popular")
    @Operation(
        summary = "Auteurs populaires",
        description = "Obtient la liste des auteurs les plus populaires (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Auteurs populaires récupérés"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getPopularAuthors(
            @Parameter(description = "Nombre maximum d'auteurs à retourner", example = "20")
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            logger.info("Demande des auteurs populaires (top {})", limit);
            
            var authors = analyticsService.getPopularAuthors(limit);
            
            return ResponseEntity.ok(authors);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des auteurs populaires", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Obtient les utilisateurs les plus actifs
     */
    @GetMapping("/users/active")
    @Operation(
        summary = "Utilisateurs actifs",
        description = "Obtient la liste des utilisateurs les plus actifs sur une période (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateurs actifs récupérés"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getMostActiveUsers(
            @Parameter(description = "Nombre de jours à analyser", example = "30")
            @RequestParam(defaultValue = "30") int days,
            @Parameter(description = "Nombre maximum d'utilisateurs à retourner", example = "20")
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            logger.info("Demande des utilisateurs actifs sur {} jours (top {})", days, limit);
            
            var users = analyticsService.getMostActiveUsers(days, limit);
            
            return ResponseEntity.ok(users);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des utilisateurs actifs", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Analyse les patterns de lecture d'un utilisateur spécifique
     */
    @GetMapping("/users/{userId}/pattern")
    @Operation(
        summary = "Pattern de lecture utilisateur",
        description = "Analyse les habitudes de lecture d'un utilisateur spécifique (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pattern de lecture analysé"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> getUserReadingPattern(
            @Parameter(description = "ID de l'utilisateur à analyser", required = true)
            @PathVariable Long userId) {
        
        try {
            logger.info("Demande d'analyse du pattern de lecture pour l'utilisateur {}", userId);
            
            var pattern = analyticsService.analyzeUserReadingPattern(userId);
            
            if (pattern == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(pattern);
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'analyse du pattern de lecture", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}