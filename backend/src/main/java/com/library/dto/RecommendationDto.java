package com.library.dto;

import com.library.model.Book;
import com.library.service.RecommendationService;

/**
 * DTO pour les recommandations de livres
 */
public class RecommendationDto {
    
    private BookDto book;
    private Double score;
    private String reason;
    private String recommendationType;
    
    // Constructeurs
    public RecommendationDto() {}
    
    public RecommendationDto(BookDto book, Double score, String reason, String recommendationType) {
        this.book = book;
        this.score = score;
        this.reason = reason;
        this.recommendationType = recommendationType;
    }
    
    /**
     * Constructeur à partir d'un RecommendationResult
     */
    public RecommendationDto(RecommendationService.RecommendationResult result, String recommendationType) {
        this.book = BookDto.fromEntity(result.getBook());
        this.score = result.getScore();
        this.reason = result.getReason();
        this.recommendationType = recommendationType;
    }
    
    // Getters et Setters
    public BookDto getBook() {
        return book;
    }
    
    public void setBook(BookDto book) {
        this.book = book;
    }
    
    public Double getScore() {
        return score;
    }
    
    public void setScore(Double score) {
        this.score = score;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getRecommendationType() {
        return recommendationType;
    }
    
    public void setRecommendationType(String recommendationType) {
        this.recommendationType = recommendationType;
    }
    
    @Override
    public String toString() {
        return "RecommendationDto{" +
                "book=" + (book != null ? book.getTitle() : "null") +
                ", score=" + score +
                ", reason='" + reason + '\'' +
                ", recommendationType='" + recommendationType + '\'' +
                '}';
    }
}