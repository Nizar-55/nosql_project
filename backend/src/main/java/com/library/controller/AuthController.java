package com.library.controller;

import com.library.dto.AuthDto;
import com.library.dto.UserDto;
import com.library.model.Role;
import com.library.model.User;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import com.library.security.JwtUtils;
import com.library.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Contrôleur d'authentification
 * Gère l'inscription, la connexion et la gestion des tokens JWT
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "API d'authentification et d'autorisation")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    /**
     * Inscription d'un nouvel utilisateur
     */
    @PostMapping("/register")
    @Operation(
        summary = "Inscription utilisateur",
        description = "Créer un nouveau compte utilisateur"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Utilisateur créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides ou utilisateur existant"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> registerUser(@Valid @RequestBody AuthDto.RegisterRequest registerRequest) {
        try {
            logger.info("Tentative d'inscription pour l'utilisateur: {}", registerRequest.getUsername());
            
            // Vérifier si l'utilisateur existe déjà
            if (userRepository.existsByUsername(registerRequest.getUsername())) {
                logger.warn("Nom d'utilisateur déjà pris: {}", registerRequest.getUsername());
                return ResponseEntity.badRequest()
                    .body(new AuthDto.MessageResponse("Erreur: Le nom d'utilisateur est déjà pris!"));
            }
            
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                logger.warn("Email déjà utilisé: {}", registerRequest.getEmail());
                return ResponseEntity.badRequest()
                    .body(new AuthDto.MessageResponse("Erreur: L'email est déjà utilisé!"));
            }
            
            // Créer le nouvel utilisateur
            User user = new User(
                registerRequest.getUsername(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFirstName(),
                registerRequest.getLastName()
            );
            
            // Assigner le rôle USER par défaut
            Optional<Role> userRole = roleRepository.findByName(Role.RoleName.USER);
            if (userRole.isEmpty()) {
                logger.error("Rôle USER non trouvé dans la base de données");
                return ResponseEntity.internalServerError()
                    .body(new AuthDto.MessageResponse("Erreur: Rôle utilisateur non configuré"));
            }
            
            user.setRole(userRole.get());
            userRepository.save(user);
            
            logger.info("Utilisateur créé avec succès: {}", user.getUsername());
            return ResponseEntity.ok(new AuthDto.MessageResponse("Utilisateur enregistré avec succès!"));
            
        } catch (Exception e) {
            logger.error("Erreur lors de l'inscription", e);
            return ResponseEntity.internalServerError()
                .body(new AuthDto.MessageResponse("Erreur lors de l'inscription"));
        }
    }
    
    /**
     * Connexion utilisateur
     */
    @PostMapping("/login")
    @Operation(
        summary = "Connexion utilisateur",
        description = "Authentifier un utilisateur et retourner un token JWT"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Connexion réussie"),
        @ApiResponse(responseCode = "401", description = "Identifiants invalides"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthDto.LoginRequest loginRequest) {
        try {
            logger.info("Tentative de connexion pour: {}", loginRequest.getUsername());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            logger.info("Connexion réussie pour: {}", loginRequest.getUsername());
            
            return ResponseEntity.ok(new AuthDto.JwtResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getAuthorities().iterator().next().getAuthority()
            ));
            
        } catch (Exception e) {
            logger.error("Erreur lors de la connexion pour: {}", loginRequest.getUsername(), e);
            return ResponseEntity.badRequest()
                .body(new AuthDto.MessageResponse("Identifiants invalides"));
        }
    }
    
    /**
     * Déconnexion utilisateur
     */
    @PostMapping("/logout")
    @Operation(
        summary = "Déconnexion utilisateur",
        description = "Déconnecter l'utilisateur (côté client principalement)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Déconnexion réussie")
    })
    public ResponseEntity<?> logoutUser() {
        logger.info("Déconnexion utilisateur");
        return ResponseEntity.ok(new AuthDto.MessageResponse("Déconnexion réussie"));
    }
    
    /**
     * Endpoint de test pour vérifier que l'API fonctionne
     */
    @GetMapping("/health")
    @Operation(
        summary = "Test de santé",
        description = "Vérifier que l'API d'authentification fonctionne"
    )
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(new AuthDto.MessageResponse("API d'authentification fonctionnelle"));
    }
    
    /**
     * Vérification de la validité du token
     */
    @GetMapping("/validate")
    @Operation(
        summary = "Validation du token",
        description = "Vérifier la validité du token JWT"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token valide"),
        @ApiResponse(responseCode = "401", description = "Token invalide")
    })
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    Optional<User> user = userRepository.findByUsername(username);
                    
                    if (user.isPresent()) {
                        UserDto userDto = UserDto.fromEntity(user.get());
                        return ResponseEntity.ok(userDto);
                    }
                }
            }
            return ResponseEntity.badRequest()
                .body(new AuthDto.MessageResponse("Token invalide"));
                
        } catch (Exception e) {
            logger.error("Erreur lors de la validation du token", e);
            return ResponseEntity.badRequest()
                .body(new AuthDto.MessageResponse("Token invalide"));
        }
    }
}