package com.library.controller;

import com.library.dto.UserDto;
import com.library.model.Book;
import com.library.model.DownloadHistory;
import com.library.model.Role;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.DownloadHistoryRepository;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour les tâches d'administration
 */
@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "API d'administration")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private DownloadHistoryRepository downloadHistoryRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    /**
     * Récupère tous les utilisateurs (Admin seulement)
     */
    @GetMapping("/users")
    @Operation(
        summary = "Liste des utilisateurs",
        description = "Récupère la liste de tous les utilisateurs avec filtres et pagination (Admin uniquement)"
    )
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            int skip = page * size;
            
            // Handle role enum
            Role.RoleName roleNameEnum = null;
            if (role != null && !role.isEmpty()) {
                try {
                    String roleStr = role.startsWith("ROLE_") ? role.substring(5) : role;
                    roleNameEnum = Role.RoleName.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                    // Invalid role name provided
                    return ResponseEntity.ok(Page.empty(PageRequest.of(page, size)));
                }
            }
            
            List<User> users = userRepository.findUsersWithFiltersPaginated(search, enabled, roleNameEnum, skip, size);
            Long total = userRepository.countUsersWithFilters(search, enabled, roleNameEnum);
            
            List<UserDto> userDtos = users.stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
            
            Pageable pageable = PageRequest.of(page, size);
            Page<UserDto> result = new com.library.util.PageImpl<>(userDtos, pageable, total != null ? total : 0);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des utilisateurs", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Active/désactive un utilisateur (Admin seulement)
     */
    @PutMapping("/users/{userId}/status")
    @Operation(
        summary = "Activer/désactiver utilisateur",
        description = "Active ou désactive un utilisateur (Admin uniquement)"
    )
    public ResponseEntity<UserDto> toggleUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> statusUpdate) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            Boolean enabled = statusUpdate.get("enabled");
            
            if (enabled != null) {
                user.setEnabled(enabled);
            } else {
                // Fallback to toggle if not specified
                user.setEnabled(!user.getEnabled());
            }
            
            User updatedUser = userRepository.save(user);
            
            logger.info("Statut utilisateur modifié: {} -> {}", 
                user.getUsername(), user.getEnabled() ? "activé" : "désactivé");
            
            return ResponseEntity.ok(UserDto.fromEntity(updatedUser));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la modification du statut utilisateur {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Change le rôle d'un utilisateur (Admin seulement)
     */
    @PutMapping("/users/{userId}/role")
    @Operation(
        summary = "Changer rôle utilisateur",
        description = "Promeut ou rétrograde un utilisateur (Admin uniquement)"
    )
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> roleUpdate) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String roleNameStr = roleUpdate.get("role");
            if (roleNameStr == null) {
                return ResponseEntity.badRequest().build();
            }

            // Normalize role name (remove ROLE_ prefix if present)
            if (roleNameStr.startsWith("ROLE_")) {
                roleNameStr = roleNameStr.substring(5);
            }

            Role.RoleName roleNameEnum;
            try {
                roleNameEnum = Role.RoleName.valueOf(roleNameStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userOpt.get();
            Optional<Role> roleOpt = roleRepository.findByName(roleNameEnum);

            if (roleOpt.isEmpty()) {
                return ResponseEntity.internalServerError().build(); // Should not happen if DB is seeded
            }

            user.setRole(roleOpt.get());
            User updatedUser = userRepository.save(user);
            
            logger.info("Rôle utilisateur modifié: {} -> {}", user.getUsername(), roleNameEnum);
            
            return ResponseEntity.ok(UserDto.fromEntity(updatedUser));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la modification du rôle utilisateur {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Endpoint de test pour vérifier l'historique des téléchargements (temporaire)
     */
    @GetMapping("/test/downloads")
    @Operation(summary = "Test historique téléchargements", description = "Endpoint de test temporaire")
    public ResponseEntity<?> testDownloads() {
        try {
            // Compter tous les téléchargements
            long totalDownloads = downloadHistoryRepository.count();
            
            // Récupérer les 10 derniers téléchargements
            List<DownloadHistory> recentDownloads = downloadHistoryRepository
                .findRecentDownloads(ZonedDateTime.now().minusDays(30), 10);
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalDownloads", totalDownloads);
            result.put("recentDownloadsCount", recentDownloads.size());
            result.put("recentDownloads", recentDownloads.stream()
                .map(dh -> Map.of(
                    "id", dh.getId(),
                    "bookTitle", dh.getBook() != null ? dh.getBook().getTitle() : "N/A",
                    "userName", dh.getUser() != null ? dh.getUser().getUsername() : "N/A",
                    "downloadedAt", dh.getDownloadedAt().toString()
                ))
                .collect(Collectors.toList()));
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors du test des téléchargements", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Endpoint de test pour créer un téléchargement fictif (temporaire)
     */
    @PostMapping("/test/create-download")
    @Operation(summary = "Créer téléchargement test", description = "Crée un téléchargement de test")
    public ResponseEntity<?> createTestDownload(@RequestParam Long userId, @RequestParam Long bookId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            Optional<Book> bookOpt = bookRepository.findById(bookId);
            
            if (userOpt.isEmpty() || bookOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Utilisateur ou livre non trouvé");
            }
            
            DownloadHistory downloadHistory = new DownloadHistory(userOpt.get(), bookOpt.get());
            downloadHistory.setIpAddress("127.0.0.1");
            downloadHistory.setUserAgent("Test Agent");
            
            DownloadHistory saved = downloadHistoryRepository.save(downloadHistory);
            
            return ResponseEntity.ok(Map.of(
                "message", "Téléchargement de test créé",
                "id", saved.getId(),
                "user", saved.getUser().getUsername(),
                "book", saved.getBook().getTitle()
            ));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la création du téléchargement de test", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
