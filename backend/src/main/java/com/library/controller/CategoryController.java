package com.library.controller;

import com.library.dto.CategoryDto;
import com.library.model.Category;
import com.library.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des catégories
 */
@RestController
@RequestMapping("/categories")
@Tag(name = "Categories", description = "API de gestion des catégories")
public class CategoryController {
    
    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    /**
     * Récupère toutes les catégories
     */
    @GetMapping
    @Operation(
        summary = "Liste des catégories",
        description = "Récupère la liste de toutes les catégories"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            List<CategoryDto> categoryDtos = categories.stream()
                .map(CategoryDto::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(categoryDtos);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des catégories", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère une catégorie par son ID
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Détails d'une catégorie",
        description = "Récupère les détails d'une catégorie par son ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Catégorie trouvée"),
        @ApiResponse(responseCode = "404", description = "Catégorie non trouvée"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        try {
            Optional<Category> category = categoryRepository.findById(id);
            
            if (category.isPresent()) {
                return ResponseEntity.ok(CategoryDto.fromEntity(category.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de la catégorie {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Crée une nouvelle catégorie (Admin seulement)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Créer une catégorie",
        description = "Créer une nouvelle catégorie (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Catégorie créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto.CreateRequest createRequest) {
        try {
            logger.info("Création d'une nouvelle catégorie: {}", createRequest.getName());
            
            // Vérifier si la catégorie existe déjà
            if (categoryRepository.findByName(createRequest.getName()).isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            Category category = new Category();
            category.setName(createRequest.getName());
            category.setDescription(createRequest.getDescription());
            category.setColor(createRequest.getColor());
            category.setIcon(createRequest.getIcon());
            
            Category savedCategory = categoryRepository.save(category);
            
            logger.info("Catégorie créée avec succès: {} (ID: {})", savedCategory.getName(), savedCategory.getId());
            return ResponseEntity.ok(CategoryDto.fromEntity(savedCategory));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la création de la catégorie", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Met à jour une catégorie (Admin seulement)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Mettre à jour une catégorie",
        description = "Mettre à jour les informations d'une catégorie (Admin uniquement)"
    )
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDto.UpdateRequest updateRequest) {
        
        try {
            Optional<Category> categoryOpt = categoryRepository.findById(id);
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Category category = categoryOpt.get();
            
            if (updateRequest.getName() != null) {
                category.setName(updateRequest.getName());
            }
            if (updateRequest.getDescription() != null) {
                category.setDescription(updateRequest.getDescription());
            }
            if (updateRequest.getColor() != null) {
                category.setColor(updateRequest.getColor());
            }
            if (updateRequest.getIcon() != null) {
                category.setIcon(updateRequest.getIcon());
            }
            
            Category updatedCategory = categoryRepository.save(category);
            
            logger.info("Catégorie mise à jour: {} (ID: {})", updatedCategory.getName(), updatedCategory.getId());
            return ResponseEntity.ok(CategoryDto.fromEntity(updatedCategory));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour de la catégorie {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime une catégorie (Admin seulement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Supprimer une catégorie",
        description = "Supprimer une catégorie (Admin uniquement)"
    )
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            if (!categoryRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // Vérifier s'il y a des livres dans cette catégorie
            // Cette vérification devrait être faite avec une requête personnalisée
            // Pour l'instant, on supprime directement
            
            categoryRepository.deleteById(id);
            
            logger.info("Catégorie supprimée: ID {}", id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de la catégorie {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}