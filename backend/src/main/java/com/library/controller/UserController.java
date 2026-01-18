package com.library.controller;

import com.library.dto.BookDto;
import com.library.dto.UserDto;
import com.library.model.Book;
import com.library.model.DownloadHistory;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.DownloadHistoryRepository;
import com.library.repository.UserRepository;
import com.library.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des utilisateurs
 */
@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "API de gestion des utilisateurs")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private DownloadHistoryRepository downloadHistoryRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Récupère le profil de l'utilisateur connecté
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Profil utilisateur",
        description = "Récupère le profil de l'utilisateur connecté"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profil récupéré"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<UserDto> getUserProfile(Principal principal) {
        try {
            Optional<User> user = userRepository.findByUsername(principal.getName());
            
            if (user.isPresent()) {
                return ResponseEntity.ok(UserDto.fromEntity(user.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du profil utilisateur", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Met à jour le profil de l'utilisateur connecté
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Mettre à jour le profil",
        description = "Met à jour le profil de l'utilisateur connecté"
    )
    public ResponseEntity<UserDto> updateUserProfile(
            @RequestBody UserDto.UpdateRequest updateRequest,
            Principal principal) {
        
        try {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Mettre à jour les champs modifiables
            if (updateRequest.getFirstName() != null) {
                user.setFirstName(updateRequest.getFirstName());
            }
            if (updateRequest.getLastName() != null) {
                user.setLastName(updateRequest.getLastName());
            }
            if (updateRequest.getBio() != null) {
                user.setBio(updateRequest.getBio());
            }
            
            User updatedUser = userRepository.save(user);
            
            logger.info("Profil mis à jour pour l'utilisateur: {}", user.getUsername());
            return ResponseEntity.ok(UserDto.fromEntity(updatedUser));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du profil", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère les favoris de l'utilisateur connecté
     */
    @GetMapping("/favorites")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Favoris utilisateur",
        description = "Récupère la liste des livres favoris de l'utilisateur"
    )
    public ResponseEntity<List<BookDto>> getUserFavorites(Principal principal) {
        try {
            Optional<User> user = userRepository.findByUsername(principal.getName());
            
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            List<BookDto> favorites = user.get().getFavorites().stream()
                .map(BookDto::fromEntity)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(favorites);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des favoris", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Ajoute un livre aux favoris
     */
    @PostMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Ajouter aux favoris",
        description = "Ajoute un livre aux favoris de l'utilisateur"
    )
    public ResponseEntity<?> addToFavorites(
            @PathVariable Long bookId,
            Principal principal) {
        
        try {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            
            if (userOpt.isEmpty() || bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            Book book = bookOpt.get();
            
            // Vérifier si déjà en favoris
            if (user.getFavorites().contains(book)) {
                return ResponseEntity.badRequest().body("Livre déjà en favoris");
            }
            
            user.addFavorite(book);
            book.incrementFavoriteCount();
            
            userRepository.save(user);
            bookRepository.save(book);
            
            logger.info("Livre {} ajouté aux favoris de {}", book.getTitle(), user.getUsername());
            return ResponseEntity.ok().body("Livre ajouté aux favoris");
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'ajout aux favoris", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Retire un livre des favoris
     */
    @DeleteMapping("/favorites/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Retirer des favoris",
        description = "Retire un livre des favoris de l'utilisateur"
    )
    public ResponseEntity<?> removeFromFavorites(
            @PathVariable Long bookId,
            Principal principal) {
        
        try {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            
            if (userOpt.isEmpty() || bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            Book book = bookOpt.get();
            
            if (!user.getFavorites().contains(book)) {
                return ResponseEntity.badRequest().body("Livre pas en favoris");
            }
            
            user.removeFavorite(book);
            book.decrementFavoriteCount();
            
            userRepository.save(user);
            bookRepository.save(book);
            
            logger.info("Livre {} retiré des favoris de {}", book.getTitle(), user.getUsername());
            return ResponseEntity.ok().body("Livre retiré des favoris");
            
        } catch (Exception e) {
            logger.error("Erreur lors du retrait des favoris", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Version simplifiée pour debug - Récupère l'historique des téléchargements
     */
    @GetMapping("/downloads-debug")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Debug historique téléchargements")
    public ResponseEntity<?> getUserDownloadsDebug(Principal principal) {
        try {
            logger.info("=== DEBUG DOWNLOADS START ===");
            
            Optional<User> user = userRepository.findByUsername(principal.getName());
            if (user.isEmpty()) {
                return ResponseEntity.ok(Map.of("error", "Utilisateur non trouvé"));
            }
            
            logger.info("Utilisateur trouvé: {} (ID: {})", user.get().getUsername(), user.get().getId());
            
            // Test 1: Compter les téléchargements
            long count = downloadHistoryRepository.countByUserId(user.get().getId());
            logger.info("Nombre de téléchargements: {}", count);
            
            // Test 2: Récupérer tous les téléchargements (sans pagination)
            List<DownloadHistory> allDownloads = downloadHistoryRepository.findByUserId(user.get().getId());
            logger.info("Téléchargements récupérés: {}", allDownloads.size());
            
            // Test 3: Vérifier les relations
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.get().getId());
            result.put("username", user.get().getUsername());
            result.put("totalDownloads", count);
            result.put("downloadsFound", allDownloads.size());
            
            List<Map<String, Object>> downloadDetails = new ArrayList<>();
            for (DownloadHistory dh : allDownloads) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", dh.getId());
                detail.put("downloadedAt", dh.getDownloadedAt());
                detail.put("hasBook", dh.getBook() != null);
                detail.put("hasUser", dh.getUser() != null);
                
                if (dh.getBook() != null) {
                    detail.put("bookId", dh.getBook().getId());
                    detail.put("bookTitle", dh.getBook().getTitle());
                }
                
                downloadDetails.add(detail);
            }
            
            result.put("downloads", downloadDetails);
            
            logger.info("=== DEBUG DOWNLOADS END ===");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur dans debug downloads", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage(), "stackTrace", e.getStackTrace()));
        }
    }
    
    /**
     * Debug avancé des téléchargements
     */
    @GetMapping("/downloads-debug-advanced")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Debug avancé téléchargements")
    public ResponseEntity<?> getDownloadsDebugAdvanced(Principal principal) {
        try {
            Optional<User> user = userRepository.findByUsername(principal.getName());
            if (user.isEmpty()) {
                return ResponseEntity.ok(Map.of("error", "Utilisateur non trouvé"));
            }
            
            logger.info("=== DEBUG AVANCÉ DOWNLOADS START ===");
            logger.info("Utilisateur: {} (ID: {})", user.get().getUsername(), user.get().getId());
            
            // Test 1: Requête directe Neo4j pour tous les téléchargements
            List<DownloadHistory> allDownloads = downloadHistoryRepository.findByUserIdOrderByDownloadedAtDesc(user.get().getId());
            logger.info("Téléchargements trouvés (requête simple): {}", allDownloads.size());
            
            // Test 2: Requête avec pagination
            List<DownloadHistory> paginatedDownloads = downloadHistoryRepository.findByUserIdWithPagination(user.get().getId(), 0, 100);
            logger.info("Téléchargements trouvés (avec pagination): {}", paginatedDownloads.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.get().getId());
            result.put("username", user.get().getUsername());
            result.put("allDownloadsCount", allDownloads.size());
            result.put("paginatedDownloadsCount", paginatedDownloads.size());
            
            // Analyser chaque téléchargement
            List<Map<String, Object>> downloadAnalysis = new ArrayList<>();
            for (DownloadHistory dh : allDownloads) {
                Map<String, Object> analysis = new HashMap<>();
                analysis.put("id", dh.getId());
                analysis.put("downloadedAt", dh.getDownloadedAt());
                analysis.put("hasUser", dh.getUser() != null);
                analysis.put("hasBook", dh.getBook() != null);
                
                if (dh.getUser() != null) {
                    analysis.put("userId", dh.getUser().getId());
                    analysis.put("username", dh.getUser().getUsername());
                }
                
                if (dh.getBook() != null) {
                    analysis.put("bookId", dh.getBook().getId());
                    analysis.put("bookTitle", dh.getBook().getTitle());
                    analysis.put("bookAvailable", dh.getBook().getAvailable());
                } else {
                    analysis.put("bookError", "LIVRE NULL - RELATION MANQUANTE");
                }
                
                downloadAnalysis.add(analysis);
            }
            
            result.put("downloadAnalysis", downloadAnalysis);
            
            // Test de conversion DTO
            List<Map<String, Object>> dtoConversion = new ArrayList<>();
            for (DownloadHistory dh : paginatedDownloads) {
                Map<String, Object> conversion = new HashMap<>();
                conversion.put("originalId", dh.getId());
                
                try {
                    com.library.dto.DownloadHistoryDto dto = com.library.dto.DownloadHistoryDto.fromEntity(dh);
                    conversion.put("dtoCreated", true);
                    conversion.put("dtoId", dto.getId());
                    conversion.put("dtoHasBook", dto.getBook() != null);
                    if (dto.getBook() != null) {
                        conversion.put("dtoBookTitle", dto.getBook().getTitle());
                    }
                } catch (Exception e) {
                    conversion.put("dtoCreated", false);
                    conversion.put("dtoError", e.getMessage());
                }
                
                dtoConversion.add(conversion);
            }
            
            result.put("dtoConversion", dtoConversion);
            
            logger.info("=== DEBUG AVANCÉ DOWNLOADS END ===");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur dans debug avancé downloads", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage(), "stackTrace", e.getStackTrace()));
        }
    }

    /**
     * Diagnostic des téléchargements
     */
    @GetMapping("/downloads-diagnostic")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Diagnostic téléchargements")
    public ResponseEntity<?> getDownloadsDiagnostic(Principal principal) {
        try {
            Optional<User> user = userRepository.findByUsername(principal.getName());
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            List<DownloadHistory> allDownloads = downloadHistoryRepository.findByUserId(user.get().getId());
            
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.get().getId());
            result.put("username", user.get().getUsername());
            result.put("totalDownloads", allDownloads.size());
            
            List<Map<String, Object>> downloadDetails = new ArrayList<>();
            for (DownloadHistory dh : allDownloads) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("id", dh.getId());
                detail.put("downloadedAt", dh.getDownloadedAt());
                detail.put("hasBook", dh.getBook() != null);
                detail.put("hasUser", dh.getUser() != null);
                
                if (dh.getBook() != null) {
                    detail.put("bookId", dh.getBook().getId());
                    detail.put("bookTitle", dh.getBook().getTitle());
                    detail.put("bookAvailable", dh.getBook().getAvailable());
                }
                
                downloadDetails.add(detail);
            }
            
            result.put("downloads", downloadDetails);
            
            // Statistiques
            long withBook = downloadDetails.stream().filter(d -> (Boolean)d.get("hasBook")).count();
            long withoutBook = downloadDetails.stream().filter(d -> !(Boolean)d.get("hasBook")).count();
            
            result.put("downloadsWithBook", withBook);
            result.put("downloadsWithoutBook", withoutBook);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors du diagnostic des téléchargements", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Récupère l'historique des téléchargements de l'utilisateur
     */
    @GetMapping("/downloads")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Historique des téléchargements",
        description = "Récupère l'historique des téléchargements de l'utilisateur"
    )
    public ResponseEntity<Page<com.library.dto.DownloadHistoryDto>> getUserDownloads(
            @Parameter(description = "Numéro de page")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page")
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        
        try {
            logger.debug("Récupération des téléchargements pour l'utilisateur: {}", principal.getName());
            
            Optional<User> user = userRepository.findByUsername(principal.getName());
            
            if (user.isEmpty()) {
                logger.warn("Utilisateur non trouvé: {}", principal.getName());
                return ResponseEntity.notFound().build();
            }
            
            logger.debug("Utilisateur trouvé: {} (ID: {})", user.get().getUsername(), user.get().getId());
            
            int skip = page * size;
            
            // Récupérer les téléchargements
            List<DownloadHistory> downloads = downloadHistoryRepository
                .findByUserIdWithPagination(user.get().getId(), skip, size);
            
            logger.debug("Téléchargements trouvés: {}", downloads.size());
            
            // Compter le total
            long total = downloadHistoryRepository.countByUserId(user.get().getId());
            
            logger.debug("Total téléchargements: {}", total);
            
            // Convertir en DTO
            List<com.library.dto.DownloadHistoryDto> downloadDtos = downloads.stream()
                .map(dh -> {
                    try {
                        logger.debug("Conversion DownloadHistory ID: {}, Book: {}", 
                            dh.getId(), dh.getBook() != null ? dh.getBook().getTitle() : "NULL");
                        return com.library.dto.DownloadHistoryDto.fromEntity(dh);
                    } catch (Exception e) {
                        logger.error("Erreur lors de la conversion du téléchargement ID: {}", dh.getId(), e);
                        return null;
                    }
                })
                .filter(dto -> dto != null) // Filtrer les nulls
                .collect(Collectors.toList());
            
            logger.debug("DTOs créés: {}", downloadDtos.size());
            
            Pageable pageable = PageRequest.of(page, size);
            Page<com.library.dto.DownloadHistoryDto> result = new com.library.util.PageImpl<>(downloadDtos, pageable, total);
            
            logger.debug("Page créée avec succès");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération de l'historique pour {}", principal.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Télécharge un livre
     */
    @GetMapping("/download/{bookId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Télécharger un livre",
        description = "Télécharge le fichier PDF d'un livre"
    )
    public ResponseEntity<Resource> downloadBook(
            @PathVariable Long bookId,
            Principal principal,
            HttpServletRequest request) {
        
        try {
            Optional<User> userOpt = userRepository.findByUsername(principal.getName());
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            
            if (userOpt.isEmpty() || bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            Book book = bookOpt.get();
            
            if (book.getPdfFile() == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Charger le fichier
            Resource resource = fileStorageService.loadFileAsResource(book.getPdfFile());
            
            // Enregistrer le téléchargement
            DownloadHistory downloadHistory = new DownloadHistory(user, book);
            downloadHistory.setIpAddress(getClientIpAddress(request));
            downloadHistory.setUserAgent(request.getHeader("User-Agent"));
            
            downloadHistoryRepository.save(downloadHistory);
            
            // Incrémenter le compteur de téléchargements
            book.incrementDownloadCount();
            bookRepository.save(book);
            
            // Déterminer le type de contenu
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                logger.info("Could not determine file type.");
            }
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            logger.info("Téléchargement du livre {} par {}", book.getTitle(), user.getUsername());
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + book.getTitle() + ".pdf\"")
                .body(resource);
                
        } catch (Exception e) {
            logger.error("Erreur lors du téléchargement du livre {}", bookId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    

    /**
     * Vide l'historique des téléchargements de l'utilisateur
     */
    @DeleteMapping("/downloads/clear")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(
        summary = "Vider l'historique",
        description = "Vide l'historique des téléchargements de l'utilisateur"
    )
    public ResponseEntity<?> clearDownloadHistory(Principal principal) {
        try {
            Optional<User> user = userRepository.findByUsername(principal.getName());
            
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            downloadHistoryRepository.deleteByUserId(user.get().getId());
            
            logger.info("Historique de téléchargement vidé pour l'utilisateur: {}", user.get().getUsername());
            return ResponseEntity.ok().body("Historique vidé avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression de l'historique", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Utilitaire pour récupérer l'adresse IP du client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }
}