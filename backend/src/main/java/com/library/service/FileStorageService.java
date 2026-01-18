package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service de gestion des fichiers
 * Gère le stockage local des fichiers (PDF, images de couverture)
 */
@Service
public class FileStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    
    private final Path fileStorageLocation;
    
    public FileStorageService(@Value("${app.file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            logger.info("Répertoire de stockage créé: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            logger.error("Impossible de créer le répertoire de stockage", ex);
            throw new RuntimeException("Impossible de créer le répertoire de stockage", ex);
        }
    }
    
    /**
     * Génère une image de couverture à partir de la première page du PDF
     * 
     * @param pdfFileName Le nom du fichier PDF (chemin relatif)
     * @return Le nom du fichier image généré (chemin relatif)
     */
    public String generateCoverFromPdf(String pdfFileName) {
        try {
            Path pdfPath = this.fileStorageLocation.resolve(pdfFileName).normalize();
            
            try (PDDocument document = PDDocument.load(pdfPath.toFile())) {
                PDFRenderer pdfRenderer = new PDFRenderer(document);
                
                // Rendre la première page (index 0)
                // Scale 2.0 pour une meilleure qualité
                BufferedImage bim = pdfRenderer.renderImageWithDPI(0, 300, ImageType.RGB);
                
                // Créer le nom du fichier image
                String baseName = pdfFileName.substring(0, pdfFileName.lastIndexOf('.'));
                String coverFileName = baseName + "_cover.jpg";
                // Assurer que le dossier covers existe si le PDF est dans un sous-dossier
                if (coverFileName.contains("/")) {
                    String folder = coverFileName.substring(0, coverFileName.lastIndexOf("/"));
                     // remplacer 'books/pdf' par 'books/covers' si possible, ou garder la même structure
                }
                
                // On va stocker la cover dans le même dossier ou un dossier 'covers'
                // Pour simplifier, on stocke à côté ou on remplace l'extension
                
                Path coverPath = this.fileStorageLocation.resolve(coverFileName);
                
                // Sauvegarder l'image
                ImageIO.write(bim, "jpg", coverPath.toFile());
                
                logger.info("Cover generated: {}", coverFileName);
                return coverFileName;
            }
        } catch (IOException ex) {
            logger.error("Erreur lors de la génération de la couverture pour: {}", pdfFileName, ex);
            // Ne pas bloquer le processus si la génération échoue, retourner null
            return null;
        }
    }

    /**
     * Retourne le chemin du répertoire de stockage
     * 
     * @return Le chemin du répertoire de stockage
     */
    public Path getUploadPath() {
        return this.fileStorageLocation;
    }
    
    /**
     * Stocke un fichier dans le système de fichiers local
     * 
     * @param file Le fichier à stocker
     * @param subDirectory Sous-répertoire (ex: "books/pdf", "books/covers")
     * @return Le nom du fichier stocké
     */
    public String storeFile(MultipartFile file, String subDirectory) {
        // Nettoyer le nom du fichier
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            // Vérifier le nom du fichier
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Nom de fichier invalide: " + originalFileName);
            }
            
            // Créer un nom de fichier unique
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            
            // Créer le sous-répertoire si nécessaire
            Path targetLocation = this.fileStorageLocation.resolve(subDirectory);
            Files.createDirectories(targetLocation);
            
            // Chemin complet du fichier
            Path filePath = targetLocation.resolve(uniqueFileName);
            
            // Copier le fichier
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Retourner le chemin relatif
            String relativePath = subDirectory + "/" + uniqueFileName;
            
            logger.info("Fichier stocké: {} -> {}", originalFileName, relativePath);
            return relativePath;
            
        } catch (IOException ex) {
            logger.error("Erreur lors du stockage du fichier: {}", originalFileName, ex);
            throw new RuntimeException("Erreur lors du stockage du fichier: " + originalFileName, ex);
        }
    }
    
    /**
     * Charge un fichier comme Resource
     * 
     * @param fileName Le nom du fichier (chemin relatif)
     * @return La Resource du fichier
     */
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                logger.warn("Fichier non trouvé: {}", fileName);
                throw new RuntimeException("Fichier non trouvé: " + fileName);
            }
        } catch (MalformedURLException ex) {
            logger.error("Fichier non trouvé: {}", fileName, ex);
            throw new RuntimeException("Fichier non trouvé: " + fileName, ex);
        }
    }
    
    /**
     * Supprime un fichier
     * 
     * @param fileName Le nom du fichier (chemin relatif)
     * @return true si supprimé avec succès
     */
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                logger.info("Fichier supprimé: {}", fileName);
            } else {
                logger.warn("Fichier non trouvé pour suppression: {}", fileName);
            }
            
            return deleted;
        } catch (IOException ex) {
            logger.error("Erreur lors de la suppression du fichier: {}", fileName, ex);
            return false;
        }
    }
    
    /**
     * Vérifie si un fichier existe
     * 
     * @param fileName Le nom du fichier (chemin relatif)
     * @return true si le fichier existe
     */
    public boolean fileExists(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            return Files.exists(filePath);
        } catch (Exception ex) {
            logger.error("Erreur lors de la vérification d'existence du fichier: {}", fileName, ex);
            return false;
        }
    }
    
    /**
     * Obtient la taille d'un fichier
     * 
     * @param fileName Le nom du fichier (chemin relatif)
     * @return La taille en bytes, -1 si erreur
     */
    public long getFileSize(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            return Files.size(filePath);
        } catch (IOException ex) {
            logger.error("Erreur lors de la récupération de la taille du fichier: {}", fileName, ex);
            return -1;
        }
    }
    
    /**
     * Obtient l'URL publique d'un fichier
     * 
     * @param fileName Le nom du fichier (chemin relatif)
     * @return L'URL publique du fichier
     */
    public String getFileUrl(String fileName) {
        // Dans un environnement de production, ceci devrait retourner l'URL complète
        // Par exemple: https://yourdomain.com/api/files/download/{fileName}
        return "/api/files/download/" + fileName;
    }
    
    /**
     * Extrait l'extension d'un fichier
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }
        
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        
        return fileName.substring(lastDotIndex);
    }
    
    /**
     * Valide le type de fichier
     * 
     * @param file Le fichier à valider
     * @param allowedTypes Les types MIME autorisés
     * @return true si le type est autorisé
     */
    public boolean isValidFileType(MultipartFile file, String... allowedTypes) {
        String contentType = file.getContentType();
        
        if (contentType == null) {
            return false;
        }
        
        for (String allowedType : allowedTypes) {
            if (contentType.equals(allowedType) || contentType.startsWith(allowedType)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Valide la taille du fichier
     * 
     * @param file Le fichier à valider
     * @param maxSizeInBytes Taille maximale en bytes
     * @return true si la taille est acceptable
     */
    public boolean isValidFileSize(MultipartFile file, long maxSizeInBytes) {
        return file.getSize() <= maxSizeInBytes;
    }
}