package com.library.config;

import com.library.model.Role;
import com.library.model.User;
import com.library.model.Category;
import com.library.model.Tag;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.TagRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Initialisation des données de base au démarrage de l'application
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private TagRepository tagRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("Initialisation des données de base...");
        
        try {
            initializeRoles();
            initializeCategories();
            initializeTags();
            initializeAdminUser();
            
            logger.info("Initialisation des données terminée avec succès");
        } catch (Exception e) {
            logger.error("Erreur lors de l'initialisation des données", e);
        }
    }
    
    private void initializeRoles() {
        logger.info("Initialisation des rôles...");
        
        // Rôle ADMIN
        if (!roleRepository.existsByName(Role.RoleName.ADMIN)) {
            Role adminRole = new Role();
            adminRole.setName(Role.RoleName.ADMIN);
            adminRole.setDescription("Administrateur avec tous les privilèges");
            // Ne pas définir les dates, laisser Neo4j les gérer
            roleRepository.save(adminRole);
            logger.info("Rôle ADMIN créé");
        }
        
        // Rôle USER
        if (!roleRepository.existsByName(Role.RoleName.USER)) {
            Role userRole = new Role();
            userRole.setName(Role.RoleName.USER);
            userRole.setDescription("Utilisateur standard avec accès limité");
            // Ne pas définir les dates, laisser Neo4j les gérer
            roleRepository.save(userRole);
            logger.info("Rôle USER créé");
        }
    }
    
    private void initializeCategories() {
        logger.info("Initialisation des catégories...");
        
        String[][] categories = {
            {"Fiction", "Romans et nouvelles de fiction", "book", "#3B82F6"},
            {"Science-Fiction", "Littérature de science-fiction et fantasy", "rocket", "#8B5CF6"},
            {"Histoire", "Livres d'histoire et biographies", "clock", "#F59E0B"},
            {"Sciences", "Livres scientifiques et techniques", "beaker", "#10B981"},
            {"Philosophie", "Ouvrages de philosophie et réflexion", "brain", "#EF4444"},
            {"Art", "Livres d'art et de culture", "palette", "#EC4899"},
            {"Informatique", "Programmation et technologies", "computer", "#6366F1"},
            {"Économie", "Économie et gestion", "trending-up", "#F97316"}
        };
        
        for (String[] catData : categories) {
            if (!categoryRepository.existsByName(catData[0])) {
                Category category = new Category();
                category.setName(catData[0]);
                category.setDescription(catData[1]);
                category.setIcon(catData[2]);
                category.setColor(catData[3]);
                // Ne pas définir les dates, laisser Neo4j les gérer
                categoryRepository.save(category);
                logger.info("Catégorie {} créée", catData[0]);
            }
        }
    }
    
    private void initializeTags() {
        logger.info("Initialisation des tags...");
        
        String[][] tags = {
            {"Bestseller", "Livre populaire", "#FFD700"},
            {"Nouveau", "Récemment ajouté", "#00FF00"},
            {"Classique", "Œuvre classique", "#8B4513"},
            {"Recommandé", "Recommandé par la communauté", "#FF6347"},
            {"Gratuit", "Livre gratuit", "#32CD32"},
            {"Premium", "Contenu premium", "#FFD700"}
        };
        
        for (String[] tagData : tags) {
            if (!tagRepository.existsByName(tagData[0])) {
                Tag tag = new Tag();
                tag.setName(tagData[0]);
                tag.setDescription(tagData[1]);
                tag.setColor(tagData[2]);
                // Ne pas définir les dates, laisser Neo4j les gérer
                tagRepository.save(tag);
                logger.info("Tag {} créé", tagData[0]);
            }
        }
    }
    
    private void initializeAdminUser() {
        logger.info("Initialisation de l'utilisateur administrateur...");
        
        Optional<User> existingAdmin = userRepository.findByUsername("admin");
        
        if (existingAdmin.isEmpty()) {
            Optional<Role> adminRole = roleRepository.findByName(Role.RoleName.ADMIN);
            
            if (adminRole.isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@library.com");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setFirstName("Admin");
                admin.setLastName("System");
                admin.setEnabled(true);
                admin.setDownloadCount(0);
                admin.setRole(adminRole.get());
                
                userRepository.save(admin);
                logger.info("Utilisateur administrateur créé (username: admin, password: password)");
            } else {
                logger.error("Impossible de créer l'utilisateur admin: rôle ADMIN non trouvé");
            }
        } else {
            // Vérifier et corriger le rôle si nécessaire
            User admin = existingAdmin.get();
            boolean changed = false;
            
            if (admin.getRole() == null) {
                logger.info("L'utilisateur administrateur existe mais n'a pas de rôle. Correction...");
                Optional<Role> adminRole = roleRepository.findByName(Role.RoleName.ADMIN);
                if (adminRole.isPresent()) {
                    admin.setRole(adminRole.get());
                    logger.info("Rôle de l'administrateur corrigé");
                    changed = true;
                }
            }
            
            if (changed) {
                userRepository.save(admin);
                logger.info("Utilisateur administrateur mis à jour");
            }
        }
    }
}