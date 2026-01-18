package com.library.controller;

import com.library.dto.TagDto;
import com.library.model.Tag;
import com.library.repository.TagRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
 * Contrôleur REST pour la gestion des tags
 */
@RestController
@RequestMapping("/tags")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags", description = "API de gestion des tags")
public class TagController {
    
    private static final Logger logger = LoggerFactory.getLogger(TagController.class);
    
    @Autowired
    private TagRepository tagRepository;
    
    /**
     * Récupère tous les tags
     */
    @GetMapping
    @Operation(
        summary = "Liste des tags",
        description = "Récupère la liste de tous les tags"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<List<TagDto>> getAllTags() {
        try {
            List<Tag> tags = tagRepository.findAll();
            List<TagDto> tagDtos = tags.stream()
                .map(TagDto::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(tagDtos);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des tags", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Recherche de tags par nom
     */
    @GetMapping("/search")
    @Operation(
        summary = "Recherche de tags",
        description = "Recherche des tags par nom (pour l'autocomplétion)"
    )
    public ResponseEntity<List<TagDto>> searchTags(@RequestParam String query) {
        try {
            List<Tag> tags = tagRepository.findByNameContainingIgnoreCase(query);
            List<TagDto> tagDtos = tags.stream()
                .map(TagDto::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(tagDtos);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la recherche de tags", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère un tag par son ID
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Détails d'un tag",
        description = "Récupère les détails d'un tag par son ID"
    )
    public ResponseEntity<TagDto> getTagById(@PathVariable Long id) {
        try {
            Optional<Tag> tag = tagRepository.findById(id);
            
            if (tag.isPresent()) {
                return ResponseEntity.ok(TagDto.fromEntity(tag.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du tag {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Crée un nouveau tag (Admin seulement)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Créer un tag",
        description = "Créer un nouveau tag (Admin uniquement)"
    )
    public ResponseEntity<TagDto> createTag(@Valid @RequestBody TagDto.CreateRequest createRequest) {
        try {
            logger.info("Création d'un nouveau tag: {}", createRequest.getName());
            
            // Vérifier si le tag existe déjà
            if (tagRepository.findByName(createRequest.getName()).isPresent()) {
                return ResponseEntity.badRequest().build();
            }
            
            Tag tag = new Tag();
            tag.setName(createRequest.getName());
            tag.setDescription(createRequest.getDescription());
            tag.setColor(createRequest.getColor());
            
            Tag savedTag = tagRepository.save(tag);
            
            logger.info("Tag créé avec succès: {} (ID: {})", savedTag.getName(), savedTag.getId());
            return ResponseEntity.ok(TagDto.fromEntity(savedTag));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la création du tag", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Met à jour un tag (Admin seulement)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Mettre à jour un tag",
        description = "Mettre à jour les informations d'un tag (Admin uniquement)"
    )
    public ResponseEntity<TagDto> updateTag(
            @PathVariable Long id,
            @Valid @RequestBody TagDto.UpdateRequest updateRequest) {
        
        try {
            Optional<Tag> tagOpt = tagRepository.findById(id);
            if (tagOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Tag tag = tagOpt.get();
            
            if (updateRequest.getName() != null) {
                tag.setName(updateRequest.getName());
            }
            if (updateRequest.getDescription() != null) {
                tag.setDescription(updateRequest.getDescription());
            }
            if (updateRequest.getColor() != null) {
                tag.setColor(updateRequest.getColor());
            }
            
            Tag updatedTag = tagRepository.save(tag);
            
            logger.info("Tag mis à jour: {} (ID: {})", updatedTag.getName(), updatedTag.getId());
            return ResponseEntity.ok(TagDto.fromEntity(updatedTag));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du tag {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime un tag (Admin seulement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Supprimer un tag",
        description = "Supprimer un tag (Admin uniquement)"
    )
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        try {
            if (!tagRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            tagRepository.deleteById(id);
            
            logger.info("Tag supprimé: ID {}", id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression du tag {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}