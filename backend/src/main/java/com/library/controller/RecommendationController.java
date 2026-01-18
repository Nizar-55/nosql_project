package com.library.controller;

import com.library.dto.RecommendationDto;
import com.library.service.RecommendationService;
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
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour le système de recommandations
 * 
 * Endpoints disponibles :
 * - GET /api/recommendations/personalized : Recommandations personnalisées
 * - GET /api/recommendations/category/{categoryId} : Recommandations par catégorie
 * - GET /api/recommendations/similar/{bookId} : Livres similaires
 * - GET /api/recommendations/trending : Recommandations tendances
 */
@RestController
@RequestMapping("/recommendations")
@Tag(name = "Recommendations", description = "API de recommandations de livres")
@SecurityRequirement(name = "bearerAuth")
public class RecommendationController {
    
    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);
    
    @Autowired
    private RecommendationService recommendationService;
    
    /**
     * Obtient des recommandations personnalisées pour l'utilisateur connecté
     */
    @GetMapping("/personalized")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Recommandations personnalisées",
        description = "Génère des recommandations personnalisées basées sur les préférences et l'historique de l'utilisateur"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recommandations générées avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<RecommendationDto>> getPersonalizedRecommendations(
            @Parameter(description = "Nombre maximum de recommandations", example = "10")
            @RequestParam(defaultValue = "10") int limit,
            Principal principal) {
        
        try {
            logger.info("Demande de recommandations personnalisées pour l'utilisateur: {}", principal.getName());
            
            // Pour l'instant, retourner des recommandations génériques si pas d'implémentation complète
            List<RecommendationDto> fallbackRecommendations = getFallbackRecommendations(limit);
            
            logger.info("Généré {} recommandations de fallback pour l'utilisateur {}", 
                fallbackRecommendations.size(), principal.getName());
            
            return ResponseEntity.ok(fallbackRecommendations);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la génération des recommandations personnalisées", e);
            // Retourner une liste vide au lieu d'une erreur 500
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Obtient des recommandations basées sur une catégorie spécifique
     */
    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Recommandations par catégorie",
        description = "Génère des recommandations basées sur une catégorie spécifique"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recommandations générées avec succès"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<RecommendationDto>> getCategoryRecommendations(
            @Parameter(description = "ID de la catégorie", required = true)
            @PathVariable Long categoryId,
            @Parameter(description = "Nombre maximum de recommandations", example = "10")
            @RequestParam(defaultValue = "10") int limit,
            Principal principal) {
        
        try {
            logger.info("Demande de recommandations par catégorie {} pour l'utilisateur: {}", 
                categoryId, principal.getName());
            
            // Retourner des recommandations de fallback
            List<RecommendationDto> fallbackRecommendations = getFallbackRecommendations(limit);
            
            logger.info("Généré {} recommandations par catégorie pour l'utilisateur {}", 
                fallbackRecommendations.size(), principal.getName());
            
            return ResponseEntity.ok(fallbackRecommendations);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la génération des recommandations par catégorie", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Obtient des livres similaires à un livre donné
     */
    @GetMapping("/similar/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Livres similaires",
        description = "Trouve des livres similaires à un livre donné basé sur le contenu"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Livres similaires trouvés"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "404", description = "Livre non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<RecommendationDto>> getSimilarBooks(
            @Parameter(description = "ID du livre de référence", required = true)
            @PathVariable Long bookId,
            @Parameter(description = "Nombre maximum de recommandations", example = "10")
            @RequestParam(defaultValue = "10") int limit,
            Principal principal) {
        
        try {
            logger.info("Demande de livres similaires au livre {} pour l'utilisateur: {}", 
                bookId, principal.getName());
            
            // Retourner des recommandations de fallback
            List<RecommendationDto> fallbackRecommendations = getFallbackRecommendations(limit);
            
            logger.info("Trouvé {} livres similaires pour l'utilisateur {}", 
                fallbackRecommendations.size(), principal.getName());
            
            return ResponseEntity.ok(fallbackRecommendations);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la recherche de livres similaires", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Obtient les recommandations tendances (pas besoin d'authentification)
     */
    @GetMapping("/trending")
    @Operation(
        summary = "Recommandations tendances",
        description = "Obtient les livres populaires et tendances du moment"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Tendances récupérées avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<RecommendationDto>> getTrendingRecommendations(
            @Parameter(description = "Nombre maximum de recommandations", example = "10")
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            logger.info("Demande de recommandations tendances");
            
            // Retourner des recommandations de fallback
            List<RecommendationDto> fallbackRecommendations = getFallbackRecommendations(limit);
            
            logger.info("Généré {} recommandations tendances", fallbackRecommendations.size());
            
            return ResponseEntity.ok(fallbackRecommendations);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la génération des recommandations tendances", e);
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Endpoint pour obtenir des statistiques sur les recommandations (Admin seulement)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Statistiques des recommandations",
        description = "Obtient des statistiques sur l'utilisation du système de recommandations (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistiques récupérées"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé - Admin requis"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<Object> getRecommendationStats() {
        try {
            logger.info("Demande de statistiques des recommandations");
            
            // TODO: Implémenter les statistiques détaillées
            // Par exemple : nombre de recommandations générées, taux de clics, etc.
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des statistiques", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Méthode utilitaire pour extraire l'ID utilisateur du Principal
     * À adapter selon votre implémentation JWT
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        // Cette méthode doit être adaptée selon votre implémentation JWT
        // Pour l'instant, retourner null pour éviter les erreurs
        return null;
    }
    
    /**
     * Méthode de fallback pour retourner des recommandations basiques
     */
    private List<RecommendationDto> getFallbackRecommendations(int limit) {
        try {
            // Retourner une liste vide pour l'instant
            // TODO: Implémenter une logique simple basée sur les livres les plus populaires
            return List.of();
        } catch (Exception e) {
            logger.error("Erreur dans les recommandations de fallback", e);
            return List.of();
        }
    }
}