package com.library.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Service pour générer automatiquement les couvertures de livres à partir des PDFs
 */
@Service
public class CoverGenerationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CoverGenerationService.class);
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Génère une couverture à partir de la première page d'un PDF
     * 
     * @param pdfFilePath Chemin vers le fichier PDF
     * @param bookId ID du livre pour nommer la couverture
     * @return Nom du fichier de couverture généré, ou null si échec
     */
    public String generateCoverFromPdf(String pdfFilePath, Long bookId) {
        try {
            logger.info("Génération de couverture pour le livre {} à partir du PDF: {}", bookId, pdfFilePath);
            
            // Construire le chemin complet du PDF
            Path pdfPath = fileStorageService.getUploadPath().resolve(pdfFilePath);
            
            if (!Files.exists(pdfPath)) {
                logger.warn("Fichier PDF non trouvé: {}", pdfPath);
                return null;
            }
            
            // Charger le document PDF
            try (PDDocument document = PDDocument.load(pdfPath.toFile())) {
                if (document.getNumberOfPages() == 0) {
                    logger.warn("Le PDF ne contient aucune page: {}", pdfPath);
                    return null;
                }
                
                // Créer le renderer PDF
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                
                // Rendre la première page en image (300 DPI pour une bonne qualité)
                BufferedImage image = pdfRenderer.renderImageWithDPI(0, 300);
                
                // Redimensionner l'image pour la couverture (ratio 2:3 typique pour les livres)
                BufferedImage coverImage = resizeImageForCover(image, 400, 600);
                
                // Générer le nom du fichier de couverture
                String coverFileName = "cover_" + bookId + "_" + System.currentTimeMillis() + ".jpg";
                
                // Sauvegarder l'image
                Path coverPath = fileStorageService.getUploadPath().resolve("covers").resolve(coverFileName);
                
                // Créer le dossier covers s'il n'existe pas
                Files.createDirectories(coverPath.getParent());
                
                // Écrire l'image
                ImageIO.write(coverImage, "jpg", coverPath.toFile());
                
                logger.info("Couverture générée avec succès: {}", coverFileName);
                return "covers/" + coverFileName;
                
            }
            
        } catch (IOException e) {
            logger.error("Erreur lors de la génération de la couverture pour le livre {}", bookId, e);
            return null;
        }
    }
    
    /**
     * Redimensionne une image pour créer une couverture de livre
     * 
     * @param originalImage Image originale
     * @param targetWidth Largeur cible
     * @param targetHeight Hauteur cible
     * @return Image redimensionnée
     */
    private BufferedImage resizeImageForCover(BufferedImage originalImage, int targetWidth, int targetHeight) {
        // Calculer les dimensions en gardant le ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        double widthRatio = (double) targetWidth / originalWidth;
        double heightRatio = (double) targetHeight / originalHeight;
        
        // Utiliser le ratio le plus petit pour que l'image tienne dans les dimensions cibles
        double ratio = Math.min(widthRatio, heightRatio);
        
        int newWidth = (int) (originalWidth * ratio);
        int newHeight = (int) (originalHeight * ratio);
        
        // Créer la nouvelle image
        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        
        // Dessiner l'image redimensionnée au centre
        var graphics = resizedImage.createGraphics();
        
        // Fond blanc
        graphics.setColor(java.awt.Color.WHITE);
        graphics.fillRect(0, 0, targetWidth, targetHeight);
        
        // Centrer l'image
        int x = (targetWidth - newWidth) / 2;
        int y = (targetHeight - newHeight) / 2;
        
        // Dessiner l'image redimensionnée
        graphics.drawImage(originalImage.getScaledInstance(newWidth, newHeight, java.awt.Image.SCALE_SMOOTH), 
                          x, y, null);
        
        graphics.dispose();
        
        return resizedImage;
    }
    
    /**
     * Génère une couverture par défaut avec le titre du livre
     * 
     * @param title Titre du livre
     * @param author Auteur du livre
     * @param bookId ID du livre
     * @return Nom du fichier de couverture généré
     */
    public String generateDefaultCover(String title, String author, Long bookId) {
        try {
            logger.info("Génération de couverture par défaut pour le livre {}: {}", bookId, title);
            
            // Dimensions de la couverture
            int width = 400;
            int height = 600;
            
            // Créer l'image
            BufferedImage coverImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            var graphics = coverImage.createGraphics();
            
            // Activer l'antialiasing
            graphics.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, 
                                    java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, 
                                    java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            
            // Fond dégradé
            java.awt.GradientPaint gradient = new java.awt.GradientPaint(
                0, 0, new java.awt.Color(70, 130, 180),  // SteelBlue
                0, height, new java.awt.Color(25, 25, 112)  // MidnightBlue
            );
            graphics.setPaint(gradient);
            graphics.fillRect(0, 0, width, height);
            
            // Bordure
            graphics.setColor(java.awt.Color.WHITE);
            graphics.setStroke(new java.awt.BasicStroke(3));
            graphics.drawRect(10, 10, width - 20, height - 20);
            
            // Titre
            graphics.setColor(java.awt.Color.WHITE);
            graphics.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 24));
            
            // Découper le titre en lignes si nécessaire
            String[] titleLines = wrapText(title, graphics.getFontMetrics(), width - 40);
            int titleY = height / 3;
            
            for (int i = 0; i < titleLines.length && i < 4; i++) {
                int titleWidth = graphics.getFontMetrics().stringWidth(titleLines[i]);
                int titleX = (width - titleWidth) / 2;
                graphics.drawString(titleLines[i], titleX, titleY + (i * 30));
            }
            
            // Auteur
            if (author != null && !author.trim().isEmpty()) {
                graphics.setFont(new java.awt.Font("Arial", java.awt.Font.ITALIC, 18));
                String[] authorLines = wrapText("par " + author, graphics.getFontMetrics(), width - 40);
                int authorY = height - 100;
                
                for (int i = 0; i < authorLines.length && i < 2; i++) {
                    int authorWidth = graphics.getFontMetrics().stringWidth(authorLines[i]);
                    int authorX = (width - authorWidth) / 2;
                    graphics.drawString(authorLines[i], authorX, authorY + (i * 25));
                }
            }
            
            graphics.dispose();
            
            // Générer le nom du fichier
            String coverFileName = "default_cover_" + bookId + "_" + System.currentTimeMillis() + ".jpg";
            
            // Sauvegarder l'image
            Path coverPath = fileStorageService.getUploadPath().resolve("covers").resolve(coverFileName);
            Files.createDirectories(coverPath.getParent());
            ImageIO.write(coverImage, "jpg", coverPath.toFile());
            
            logger.info("Couverture par défaut générée avec succès: {}", coverFileName);
            return "covers/" + coverFileName;
            
        } catch (IOException e) {
            logger.error("Erreur lors de la génération de la couverture par défaut pour le livre {}", bookId, e);
            return null;
        }
    }
    
    /**
     * Découpe un texte en lignes pour qu'il tienne dans une largeur donnée
     */
    private String[] wrapText(String text, java.awt.FontMetrics metrics, int maxWidth) {
        if (text == null || text.trim().isEmpty()) {
            return new String[0];
        }
        
        String[] words = text.split("\\s+");
        java.util.List<String> lines = new java.util.ArrayList<>();
        StringBuilder currentLine = new StringBuilder();
        
        for (String word : words) {
            String testLine = currentLine.length() == 0 ? word : currentLine + " " + word;
            
            if (metrics.stringWidth(testLine) <= maxWidth) {
                currentLine = new StringBuilder(testLine);
            } else {
                if (currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                    currentLine = new StringBuilder(word);
                } else {
                    // Le mot est trop long, le tronquer
                    lines.add(word.substring(0, Math.min(word.length(), 20)) + "...");
                }
            }
        }
        
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }
        
        return lines.toArray(new String[0]);
    }
}