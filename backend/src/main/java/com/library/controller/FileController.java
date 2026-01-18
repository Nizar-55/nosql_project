package com.library.controller;

import com.library.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * Contrôleur pour servir les fichiers statiques
 */
@RestController
@RequestMapping("/files")
@Tag(name = "Files", description = "API de gestion des fichiers statiques")
public class FileController {
    
    private static final Logger logger = LoggerFactory.getLogger(FileController.class);
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Télécharge un fichier par son nom
     */
    @GetMapping("/download/{fileName:.+}")
    @Operation(
        summary = "Télécharger un fichier",
        description = "Télécharge un fichier par son nom"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Fichier téléchargé"),
        @ApiResponse(responseCode = "404", description = "Fichier non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName,
            HttpServletRequest request) {
        
        try {
            // Charger le fichier comme Resource
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            
            // Déterminer le type de contenu du fichier
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                logger.info("Could not determine file type for: {}", fileName);
            }
            
            // Type de contenu par défaut
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
                
        } catch (Exception ex) {
            logger.error("Erreur lors du téléchargement du fichier: {}", fileName, ex);
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Affiche une image (pour les couvertures de livres)
     */
    @GetMapping("/images/{fileName:.+}")
    @Operation(
        summary = "Afficher une image",
        description = "Affiche une image (couverture de livre)"
    )
    public ResponseEntity<Resource> displayImage(
            @PathVariable String fileName,
            HttpServletRequest request) {
        
        try {
            // Charger le fichier comme Resource
            Resource resource = fileStorageService.loadFileAsResource("covers/" + fileName);
            
            // Déterminer le type de contenu
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                logger.info("Could not determine file type for image: {}", fileName);
            }
            
            // Type de contenu par défaut pour les images
            if (contentType == null) {
                contentType = "image/jpeg";
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600") // Cache 1 heure
                .body(resource);
                
        } catch (Exception ex) {
            logger.error("Erreur lors de l'affichage de l'image: {}", fileName, ex);
            return ResponseEntity.notFound().build();
        }
    }
}