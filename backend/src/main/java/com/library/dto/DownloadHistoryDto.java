package com.library.dto;

import java.time.ZonedDateTime;

/**
 * DTO pour l'historique des téléchargements
 */
public class DownloadHistoryDto {
    
    private Long id;
    private BookDto book;
    private ZonedDateTime downloadedAt;
    private String ipAddress;
    private String userAgent;
    
    // Constructeurs
    public DownloadHistoryDto() {}
    
    public DownloadHistoryDto(Long id, BookDto book, ZonedDateTime downloadedAt) {
        this.id = id;
        this.book = book;
        this.downloadedAt = downloadedAt;
    }
    
    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public BookDto getBook() { return book; }
    public void setBook(BookDto book) { this.book = book; }
    
    public ZonedDateTime getDownloadedAt() { return downloadedAt; }
    public void setDownloadedAt(ZonedDateTime downloadedAt) { this.downloadedAt = downloadedAt; }
    
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    
    /**
     * Convertit une entité DownloadHistory en DTO
     */
    public static DownloadHistoryDto fromEntity(com.library.model.DownloadHistory downloadHistory) {
        if (downloadHistory == null) {
            return null;
        }
        
        DownloadHistoryDto dto = new DownloadHistoryDto();
        dto.setId(downloadHistory.getId());
        dto.setDownloadedAt(downloadHistory.getDownloadedAt());
        dto.setIpAddress(downloadHistory.getIpAddress());
        dto.setUserAgent(downloadHistory.getUserAgent());
        
        // Créer un BookDto même si le livre est null
        if (downloadHistory.getBook() != null) {
            try {
                dto.setBook(BookDto.fromEntity(downloadHistory.getBook()));
            } catch (Exception e) {
                System.err.println("Erreur lors de la conversion du livre pour DownloadHistory ID: " + downloadHistory.getId());
                e.printStackTrace();
                // Créer un BookDto minimal si la conversion échoue
                BookDto bookDto = new BookDto();
                bookDto.setId(downloadHistory.getBook().getId());
                bookDto.setTitle(downloadHistory.getBook().getTitle() != null ? downloadHistory.getBook().getTitle() : "Titre non disponible");
                bookDto.setAuthor(downloadHistory.getBook().getAuthor() != null ? downloadHistory.getBook().getAuthor() : "Auteur inconnu");
                bookDto.setCategoryName("Non classé");
                dto.setBook(bookDto);
            }
        } else {
            // Créer un BookDto minimal si pas de livre associé
            System.err.println("ATTENTION: DownloadHistory ID " + downloadHistory.getId() + " n'a pas de livre associé! Création d'un livre factice.");
            
            BookDto bookDto = new BookDto();
            bookDto.setId(0L);
            bookDto.setTitle("Livre non disponible");
            bookDto.setAuthor("Auteur inconnu");
            bookDto.setCategoryName("Non classé");
            bookDto.setAvailable(false);
            dto.setBook(bookDto);
        }
        
        return dto;
    }
}