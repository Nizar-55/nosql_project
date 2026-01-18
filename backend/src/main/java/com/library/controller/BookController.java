package com.library.controller;

import com.library.dto.BookDto;
import com.library.model.Book;
import com.library.model.Category;
import com.library.model.Tag;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.TagRepository;
import com.library.repository.UserRepository;
import com.library.service.FileStorageService;
import com.library.service.CoverGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Contrôleur REST pour la gestion des livres
 */
@RestController
@RequestMapping("/books")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Books", description = "API de gestion des livres")
public class BookController {
    
    private static final Logger logger = LoggerFactory.getLogger(BookController.class);
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private CoverGenerationService coverGenerationService;
    
    /**
     * Endpoint de test public pour vérifier la connectivité
     */
    @GetMapping("/test/ping")
    @Operation(
        summary = "Test de connectivité",
        description = "Endpoint public pour tester la connectivité API"
    )
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of(
            "message", "API fonctionne correctement",
            "timestamp", System.currentTimeMillis(),
            "version", "1.0.0"
        ));
    }
    
    /**
     * Endpoint de diagnostic pour les couvertures
     */
    @GetMapping("/test/covers")
    @Operation(summary = "Test des couvertures", description = "Diagnostic des couvertures de livres")
    public ResponseEntity<?> testCovers() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test 1: Vérifier les livres
            List<Book> allBooks = bookRepository.findAllAvailable();
            result.put("totalBooks", allBooks.size());
            
            // Statistiques des couvertures
            long booksWithPdf = allBooks.stream()
                .filter(book -> book.getPdfFile() != null && !book.getPdfFile().isEmpty())
                .count();
            
            long booksWithCover = allBooks.stream()
                .filter(book -> book.getCoverImage() != null && !book.getCoverImage().isEmpty())
                .count();
            
            result.put("booksWithPdf", booksWithPdf);
            result.put("booksWithCover", booksWithCover);
            result.put("booksWithoutCover", allBooks.size() - booksWithCover);
            
            // Test 2: Vérifier les dossiers
            Path uploadsPath = fileStorageService.getUploadPath();
            Path coversPath = uploadsPath.resolve("covers");
            
            result.put("uploadsPath", uploadsPath.toString());
            result.put("coversPath", coversPath.toString());
            result.put("uploadsExists", Files.exists(uploadsPath));
            result.put("coversExists", Files.exists(coversPath));
            
            // Test 3: Lister quelques livres avec détails
            List<Map<String, Object>> bookDetails = allBooks.stream()
                .limit(5)
                .map(book -> {
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", book.getId());
                    details.put("title", book.getTitle());
                    details.put("pdfFile", book.getPdfFile());
                    details.put("coverImage", book.getCoverImage());
                    details.put("hasPdf", book.getPdfFile() != null && !book.getPdfFile().isEmpty());
                    details.put("hasCover", book.getCoverImage() != null && !book.getCoverImage().isEmpty());
                    return details;
                })
                .collect(Collectors.toList());
            
            result.put("sampleBooks", bookDetails);
            
            // Test 4: Vérifier si PDFBox est disponible
            try {
                Class.forName("org.apache.pdfbox.pdmodel.PDDocument");
                result.put("pdfBoxAvailable", true);
            } catch (ClassNotFoundException e) {
                result.put("pdfBoxAvailable", false);
                result.put("pdfBoxError", "PDFBox non trouvé dans le classpath");
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors du test des couvertures", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/test/filters")
    @Operation(summary = "Test des filtres", description = "Endpoint de test pour diagnostiquer les filtres")
    public ResponseEntity<?> testFilters(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String tags) {
        
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Test 1: Compter tous les livres
            List<Book> allBooks = bookRepository.findAllAvailable();
            result.put("totalBooks", allBooks.size());
            
            // Test 2: Tester les filtres simplifiés
            if (categoryId != null || tags != null) {
                List<Book> filteredBooks = bookRepository.findBooksWithSimpleFilters(
                    categoryId, tags
                );
                result.put("filteredBooks", filteredBooks.size());
                result.put("filters", Map.of(
                    "categoryId", categoryId != null ? categoryId : "null",
                    "tags", tags != null ? tags : "null"
                ));
            }
            
            // Test 3: Vérifier les relations
            if (categoryId != null) {
                long countByCategory = bookRepository.countByCategoryId(categoryId);
                result.put("countByCategory", countByCategory);
            }
            
            // Test 4: Lister quelques livres avec leurs détails
            List<Map<String, Object>> bookDetails = allBooks.stream()
                .limit(5)
                .map(book -> {
                    Map<String, Object> details = new HashMap<>();
                    details.put("id", book.getId());
                    details.put("title", book.getTitle());
                    details.put("author", book.getAuthor());
                    details.put("language", book.getLanguage());
                    details.put("publicationYear", book.getPublicationYear());
                    details.put("available", book.getAvailable());
                    details.put("categoryId", book.getCategory() != null ? book.getCategory().getId() : null);
                    details.put("categoryName", book.getCategory() != null ? book.getCategory().getName() : null);
                    return details;
                })
                .collect(Collectors.toList());
            
            result.put("sampleBooks", bookDetails);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors du test des filtres", e);
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Récupère tous les livres avec pagination et filtres avancés
     */
    @GetMapping
    @Operation(
        summary = "Liste des livres",
        description = "Récupère la liste paginée des livres disponibles avec filtres avancés"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<Page<BookDto>> getAllBooks(
            @Parameter(description = "Numéro de page (0-based)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page")
            @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Critère de tri")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri")
            @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filtrer par catégorie ID")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Filtrer par tags (séparés par virgule)")
            @RequestParam(required = false) String tags) {
        
        try {
            logger.debug("Récupération des livres avec paramètres: page={}, size={}, sortBy={}, sortDir={}", 
                page, size, sortBy, sortDir);
            logger.debug("Filtres: categoryId={}, tags={}", categoryId, tags);
            
            int skip = page * size;
            List<Book> books;
            
            // Si des filtres sont appliqués, utiliser la recherche simplifiée
            if (categoryId != null || tags != null) {
                logger.debug("Utilisation de la recherche simplifiée avec filtres");
                books = bookRepository.findBooksWithSimpleFilters(categoryId, tags);
                logger.debug("Livres trouvés avec filtres: {}", books.size());
            } else {
                logger.debug("Récupération de tous les livres disponibles");
                books = bookRepository.findAllAvailable();
                logger.debug("Tous les livres disponibles: {}", books.size());
            }
            
            // Tri
            books = sortBooks(books, sortBy, sortDir);
            logger.debug("Livres après tri: {}", books.size());
            
            // Pagination manuelle
            List<Book> paginatedBooks = books.stream()
                .skip(skip)
                .limit(size)
                .collect(Collectors.toList());
            
            logger.debug("Livres après pagination: {}", paginatedBooks.size());
            
            List<BookDto> bookDtos = paginatedBooks.stream()
                .map(book -> {
                    try {
                        return BookDto.fromEntity(book);
                    } catch (Exception e) {
                        logger.error("Erreur lors de la conversion du livre ID: {}", book.getId(), e);
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            
            logger.debug("DTOs créés: {}", bookDtos.size());
            
            Pageable pageable = PageRequest.of(page, size);
            Page<BookDto> result = new com.library.util.PageImpl<>(bookDtos, pageable, books.size());
            
            logger.debug("Page créée avec succès - Total: {}, Pages: {}", result.getTotalElements(), result.getTotalPages());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des livres", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Méthode utilitaire pour trier les livres
     */
    private List<Book> sortBooks(List<Book> books, String sortBy, String sortDir) {
        boolean ascending = "asc".equalsIgnoreCase(sortDir);
        
        return books.stream()
            .sorted((b1, b2) -> {
                int comparison = 0;
                
                switch (sortBy) {
                    case "title":
                        comparison = b1.getTitle().compareToIgnoreCase(b2.getTitle());
                        break;
                    case "author":
                        comparison = b1.getAuthor().compareToIgnoreCase(b2.getAuthor());
                        break;
                    case "downloadCount":
                        comparison = Long.compare(b1.getDownloadCount(), b2.getDownloadCount());
                        break;
                    case "favoriteCount":
                        comparison = Long.compare(b1.getFavoriteCount(), b2.getFavoriteCount());
                        break;
                    case "publicationYear":
                        Integer year1 = b1.getPublicationYear();
                        Integer year2 = b2.getPublicationYear();
                        if (year1 == null && year2 == null) comparison = 0;
                        else if (year1 == null) comparison = 1;
                        else if (year2 == null) comparison = -1;
                        else comparison = year1.compareTo(year2);
                        break;
                    case "createdAt":
                    default:
                        comparison = b1.getCreatedAt().compareTo(b2.getCreatedAt());
                        break;
                }
                
                return ascending ? comparison : -comparison;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Récupère un livre par son ID
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Détails d'un livre",
        description = "Récupère les détails d'un livre par son ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Livre trouvé"),
        @ApiResponse(responseCode = "404", description = "Livre non trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<BookDto> getBookById(@PathVariable Long id) {
        try {
            Optional<Book> book = bookRepository.findById(id);
            
            if (book.isPresent()) {
                return ResponseEntity.ok(BookDto.fromEntity(book.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du livre {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Recherche de livres
     */
    @GetMapping("/search")
    @Operation(
        summary = "Recherche de livres",
        description = "Recherche avancée de livres par titre, auteur, tags ou catégorie"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Résultats de recherche"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<Page<BookDto>> searchBooks(
            @Parameter(description = "Terme de recherche")
            @RequestParam String query,
            @Parameter(description = "Numéro de page")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de la page")
            @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Critère de tri")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Direction du tri")
            @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filtrer par catégorie ID")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Filtrer par tags (séparés par virgule)")
            @RequestParam(required = false) String tags) {
        
        try {
            logger.debug("Recherche avec query='{}' et filtres: categoryId={}, tags={}", 
                query, categoryId, tags);
            
            int skip = page * size;
            List<Book> books;
            
            // Utiliser la recherche simplifiée qui combine recherche textuelle et filtres
            books = bookRepository.searchBooksWithSimpleFilters(
                query, categoryId, tags
            );
            
            logger.debug("Livres trouvés avec recherche et filtres: {}", books.size());
            
            // Tri
            books = sortBooks(books, sortBy, sortDir);
            
            // Pagination manuelle
            List<Book> paginatedBooks = books.stream()
                .skip(skip)
                .limit(size)
                .collect(Collectors.toList());
            
            List<BookDto> bookDtos = paginatedBooks.stream()
                .map(book -> {
                    try {
                        return BookDto.fromEntity(book);
                    } catch (Exception e) {
                        logger.error("Erreur lors de la conversion du livre ID: {}", book.getId(), e);
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
            
            Pageable pageable = PageRequest.of(page, size);
            Page<BookDto> result = new com.library.util.PageImpl<>(bookDtos, pageable, books.size());
            
            logger.debug("Recherche terminée - Total: {}, Pages: {}", result.getTotalElements(), result.getTotalPages());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la recherche de livres", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère les filtres disponibles
     */
    @GetMapping("/filters")
    @Operation(
        summary = "Filtres disponibles",
        description = "Récupère les options de filtrage disponibles (langues, années, etc.)"
    )
    public ResponseEntity<Map<String, Object>> getAvailableFilters() {
        try {
            List<String> languages = bookRepository.findAllLanguages();
            List<Integer> years = bookRepository.findAllPublicationYears();
            List<Category> categories = categoryRepository.findAll();
            
            Map<String, Object> filters = Map.of(
                "languages", languages,
                "years", years,
                "categories", categories.stream()
                    .map(c -> Map.of("id", c.getId(), "name", c.getName()))
                    .collect(Collectors.toList())
            );
            
            return ResponseEntity.ok(filters);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des filtres", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Récupère les livres par catégorie
     */
    @GetMapping("/category/{categoryId}")
    @Operation(
        summary = "Livres par catégorie",
        description = "Récupère les livres d'une catégorie spécifique"
    )
    public ResponseEntity<Page<BookDto>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        
        try {
            int skip = page * size;
            List<Book> books = bookRepository.findByCategoryIdPaginated(categoryId, skip, size);
            long total = bookRepository.countByCategoryId(categoryId);
            
            List<BookDto> bookDtos = books.stream()
                .map(BookDto::fromEntity)
                .collect(Collectors.toList());
            
            Pageable pageable = PageRequest.of(page, size);
            Page<BookDto> result = new com.library.util.PageImpl<>(bookDtos, pageable, total);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des livres par catégorie", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Crée un nouveau livre (Admin seulement)
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Créer un livre",
        description = "Créer un nouveau livre (Admin uniquement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Livre créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "401", description = "Non authentifié"),
        @ApiResponse(responseCode = "403", description = "Accès refusé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<BookDto> createBook(
            @RequestPart("book") @Valid BookDto.CreateRequest createRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            logger.info("Création d'un nouveau livre: {}", createRequest.getTitle());
            
            // Vérifier que la catégorie existe
            Optional<Category> category = categoryRepository.findById(createRequest.getCategoryId());
            if (category.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Créer le livre
            Book book = new Book();
            book.setTitle(createRequest.getTitle());
            book.setAuthor(createRequest.getAuthor());
            book.setIsbn(createRequest.getIsbn());
            book.setDescription(createRequest.getDescription());
            book.setPublicationYear(createRequest.getPublicationYear());
            book.setPageCount(createRequest.getPageCount());
            book.setLanguage(createRequest.getLanguage());
            book.setCategory(category.get());
            
            // Gérer les tags
            if (createRequest.getTagNames() != null && !createRequest.getTagNames().isEmpty()) {
                Set<com.library.model.Tag> tags = createRequest.getTagNames().stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            com.library.model.Tag newTag = new com.library.model.Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        }))
                    .collect(Collectors.toSet());
                book.setTags(tags);
            }

            // Gérer le fichier PDF si présent
            if (file != null && !file.isEmpty()) {
                // Valider que c'est un PDF
                if (!file.getContentType().equals("application/pdf")) {
                    return ResponseEntity.badRequest().build();
                }
                
                // Sauvegarder le PDF
                String pdfFileName = fileStorageService.storeFile(file, "books/pdf");
                book.setPdfFile(pdfFileName);
                book.setFileSize(file.getSize());
            }
            
            // Sauvegarder le livre d'abord pour avoir un ID
            Book savedBook = bookRepository.save(book);
            
            // Générer la couverture après avoir sauvegardé le livre
            if (savedBook.getPdfFile() != null) {
                logger.info("Génération de couverture pour le nouveau livre: {}", savedBook.getTitle());
                
                String coverFileName = coverGenerationService.generateCoverFromPdf(
                    savedBook.getPdfFile(), savedBook.getId()
                );
                
                if (coverFileName != null) {
                    savedBook.setCoverImage(coverFileName);
                    logger.info("Couverture générée: {}", coverFileName);
                } else {
                    // Générer une couverture par défaut
                    String defaultCoverFileName = coverGenerationService.generateDefaultCover(
                        savedBook.getTitle(), savedBook.getAuthor(), savedBook.getId()
                    );
                    
                    if (defaultCoverFileName != null) {
                        savedBook.setCoverImage(defaultCoverFileName);
                        logger.info("Couverture par défaut générée: {}", defaultCoverFileName);
                    }
                }
                
                // Sauvegarder à nouveau avec la couverture
                savedBook = bookRepository.save(savedBook);
            } else {
                // Pas de PDF, générer une couverture par défaut
                String defaultCoverFileName = coverGenerationService.generateDefaultCover(
                    savedBook.getTitle(), savedBook.getAuthor(), savedBook.getId()
                );
                
                if (defaultCoverFileName != null) {
                    savedBook.setCoverImage(defaultCoverFileName);
                    savedBook = bookRepository.save(savedBook);
                    logger.info("Couverture par défaut générée: {}", defaultCoverFileName);
                }
            }
            
            logger.info("Livre créé avec succès: {} (ID: {})", savedBook.getTitle(), savedBook.getId());
            return ResponseEntity.ok(BookDto.fromEntity(savedBook));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la création du livre", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Met à jour un livre (Admin seulement)
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Mettre à jour un livre",
        description = "Mettre à jour les informations d'un livre (Admin uniquement)"
    )
    public ResponseEntity<BookDto> updateBook(
            @PathVariable Long id,
            @RequestPart("book") @Valid BookDto.UpdateRequest updateRequest,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        
        try {
            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Book book = bookOpt.get();
            
            // Mettre à jour les champs
            if (updateRequest.getTitle() != null) book.setTitle(updateRequest.getTitle());
            if (updateRequest.getAuthor() != null) book.setAuthor(updateRequest.getAuthor());
            if (updateRequest.getDescription() != null) book.setDescription(updateRequest.getDescription());
            
            if (updateRequest.getCategoryId() != null) {
                Optional<Category> category = categoryRepository.findById(updateRequest.getCategoryId());
                if (category.isPresent()) {
                    book.setCategory(category.get());
                }
            }
            
            if (updateRequest.getIsbn() != null) book.setIsbn(updateRequest.getIsbn());
            if (updateRequest.getPublicationYear() != null) book.setPublicationYear(updateRequest.getPublicationYear());
            if (updateRequest.getPageCount() != null) book.setPageCount(updateRequest.getPageCount());
            if (updateRequest.getLanguage() != null) book.setLanguage(updateRequest.getLanguage());

            // Mettre à jour les tags si fournis
            if (updateRequest.getTagNames() != null) {
                Set<com.library.model.Tag> tags = updateRequest.getTagNames().stream()
                    .map(tagName -> tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            com.library.model.Tag newTag = new com.library.model.Tag();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        }))
                    .collect(Collectors.toSet());
                book.setTags(tags);
            }

            // Gérer le fichier PDF si présent
            if (file != null && !file.isEmpty()) {
                // Sauvegarder le PDF
                String pdfPath = fileStorageService.storeFile(file, "books/pdf");
                book.setPdfFile(pdfPath);
                book.setFileSize(file.getSize());
                
                // Générer la couverture
                String coverFileName = coverGenerationService.generateCoverFromPdf(pdfPath, book.getId());
                if (coverFileName != null) {
                    book.setCoverImage(coverFileName);
                }
            }
            
            Book updatedBook = bookRepository.save(book);
            
            logger.info("Livre mis à jour: {} (ID: {})", updatedBook.getTitle(), updatedBook.getId());
            return ResponseEntity.ok(BookDto.fromEntity(updatedBook));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la mise à jour du livre {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Supprime un livre (Admin seulement)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Supprimer un livre",
        description = "Supprimer un livre (Admin uniquement)"
    )
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        try {
            if (!bookRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            bookRepository.deleteById(id);
            
            logger.info("Livre supprimé: ID {}", id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression du livre {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Upload de fichier PDF pour un livre (Admin seulement)
     */
    @PostMapping("/{id}/upload-pdf")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Upload PDF",
        description = "Uploader le fichier PDF d'un livre (Admin uniquement)"
    )
    public ResponseEntity<?> uploadPdf(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        try {
            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Book book = bookOpt.get();
            
            // Valider le fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Fichier vide");
            }
            
            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Seuls les fichiers PDF sont acceptés");
            }
            
            // Sauvegarder le fichier
            String fileName = fileStorageService.storeFile(file, "books/pdf");
            book.setPdfFile(fileName);
            book.setFileSize(file.getSize());
            
            // Générer automatiquement une couverture si elle n'existe pas
            if (book.getCoverImage() == null || book.getCoverImage().isEmpty()) {
                logger.info("Génération automatique de couverture pour le livre: {}", book.getTitle());
                
                String coverFileName = coverGenerationService.generateCoverFromPdf(fileName, book.getId());
                
                if (coverFileName != null) {
                    book.setCoverImage(coverFileName);
                    logger.info("Couverture générée automatiquement: {}", coverFileName);
                } else {
                    // Si la génération depuis le PDF échoue, créer une couverture par défaut
                    logger.info("Génération de couverture par défaut pour le livre: {}", book.getTitle());
                    String defaultCoverFileName = coverGenerationService.generateDefaultCover(
                        book.getTitle(), book.getAuthor(), book.getId()
                    );
                    
                    if (defaultCoverFileName != null) {
                        book.setCoverImage(defaultCoverFileName);
                        logger.info("Couverture par défaut générée: {}", defaultCoverFileName);
                    }
                }
            }
            
            bookRepository.save(book);
            
            logger.info("PDF uploadé pour le livre: {} (ID: {})", book.getTitle(), book.getId());
            return ResponseEntity.ok().body(Map.of(
                "message", "PDF uploadé avec succès",
                "coverGenerated", book.getCoverImage() != null
            ));
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'upload du PDF pour le livre {}", id, e);
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload");
        }
    }
    
    /**
     * Régénère les couvertures pour tous les livres avec PDF (Admin seulement)
     */
    @PostMapping("/regenerate-covers")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Régénérer les couvertures",
        description = "Régénère les couvertures pour tous les livres avec PDF (Admin uniquement)"
    )
    public ResponseEntity<?> regenerateCovers() {
        try {
            logger.info("Début de la régénération des couvertures");
            
            // Récupérer tous les livres avec PDF mais sans couverture
            List<Book> booksWithoutCovers = bookRepository.findAllAvailable().stream()
                .filter(book -> book.getPdfFile() != null && !book.getPdfFile().isEmpty())
                .filter(book -> book.getCoverImage() == null || book.getCoverImage().isEmpty())
                .collect(Collectors.toList());
            
            logger.info("Livres à traiter: {}", booksWithoutCovers.size());
            
            int successCount = 0;
            int errorCount = 0;
            
            for (Book book : booksWithoutCovers) {
                try {
                    logger.info("Génération de couverture pour: {} (ID: {})", book.getTitle(), book.getId());
                    
                    String coverFileName = coverGenerationService.generateCoverFromPdf(
                        book.getPdfFile(), book.getId()
                    );
                    
                    if (coverFileName != null) {
                        book.setCoverImage(coverFileName);
                        bookRepository.save(book);
                        successCount++;
                        logger.info("Couverture générée avec succès: {}", coverFileName);
                    } else {
                        // Générer une couverture par défaut
                        String defaultCoverFileName = coverGenerationService.generateDefaultCover(
                            book.getTitle(), book.getAuthor(), book.getId()
                        );
                        
                        if (defaultCoverFileName != null) {
                            book.setCoverImage(defaultCoverFileName);
                            bookRepository.save(book);
                            successCount++;
                            logger.info("Couverture par défaut générée: {}", defaultCoverFileName);
                        } else {
                            errorCount++;
                            logger.error("Impossible de générer une couverture pour: {}", book.getTitle());
                        }
                    }
                    
                } catch (Exception e) {
                    errorCount++;
                    logger.error("Erreur lors de la génération de couverture pour: {}", book.getTitle(), e);
                }
            }
            
            Map<String, Object> result = Map.of(
                "message", "Régénération des couvertures terminée",
                "totalProcessed", booksWithoutCovers.size(),
                "successCount", successCount,
                "errorCount", errorCount
            );
            
            logger.info("Régénération terminée - Succès: {}, Erreurs: {}", successCount, errorCount);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Erreur lors de la régénération des couvertures", e);
            return ResponseEntity.internalServerError().body("Erreur lors de la régénération");
        }
    }
    @PostMapping("/{id}/upload-cover")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(
        summary = "Upload couverture",
        description = "Uploader l'image de couverture d'un livre (Admin uniquement)"
    )
    public ResponseEntity<?> uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        try {
            Optional<Book> bookOpt = bookRepository.findById(id);
            if (bookOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Book book = bookOpt.get();
            
            // Valider le fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Fichier vide");
            }
            
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Seules les images sont acceptées");
            }
            
            // Sauvegarder le fichier
            String fileName = fileStorageService.storeFile(file, "books/covers");
            book.setCoverImage(fileName);
            
            bookRepository.save(book);
            
            logger.info("Couverture uploadée pour le livre: {} (ID: {})", book.getTitle(), book.getId());
            return ResponseEntity.ok().body("Couverture uploadée avec succès");
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'upload de la couverture pour le livre {}", id, e);
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload");
        }
    }
}