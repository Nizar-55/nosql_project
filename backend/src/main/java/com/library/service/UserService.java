package com.library.service;

import com.library.dto.UserDto;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Role;
import com.library.model.User;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import com.library.util.PageImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour la gestion des utilisateurs
 */
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Trouve tous les utilisateurs avec pagination
     */
    public Page<UserDto> findAllUsers(Pageable pageable) {
        int skip = pageable.getPageNumber() * pageable.getPageSize();
        int limit = pageable.getPageSize();
        
        List<User> users = userRepository.searchUsersPaginated(null, skip, limit);
        long total = userRepository.count();
        
        List<UserDto> userDtos = users.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        return new PageImpl<>(userDtos, pageable, total);
    }
    
    /**
     * Trouve un utilisateur par ID
     */
    public UserDto findUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
        return convertToDto(user);
    }
    
    /**
     * Trouve un utilisateur par nom d'utilisateur
     */
    public UserDto findUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé: " + username));
        return convertToDto(user);
    }
    
    /**
     * Crée un nouvel utilisateur
     */
    public UserDto createUser(UserDto userDto, String password) {
        // Vérifier si l'utilisateur existe déjà
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Erreur: Le nom d'utilisateur est déjà pris!");
        }
        
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Erreur: L'email est déjà utilisé!");
        }
        
        // Créer le nouvel utilisateur
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setBio(userDto.getBio());
        user.setEnabled(true);
        
        // Assigner le rôle par défaut (USER)
        Role userRole = roleRepository.findByName(Role.RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Erreur: Rôle non trouvé."));
        user.setRole(userRole);
        
        User savedUser = userRepository.save(user);
        return convertToDto(savedUser);
    }
    
    /**
     * Met à jour un utilisateur
     */
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
        
        // Vérifier l'unicité du nom d'utilisateur et de l'email
        if (!user.getUsername().equals(userDto.getUsername()) && 
            userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Erreur: Le nom d'utilisateur est déjà pris!");
        }
        
        if (!user.getEmail().equals(userDto.getEmail()) && 
            userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Erreur: L'email est déjà utilisé!");
        }
        
        // Mettre à jour les champs
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setBio(userDto.getBio());
        user.setEnabled(userDto.getEnabled());
        
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    /**
     * Supprime un utilisateur
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
        userRepository.delete(user);
    }
    
    /**
     * Recherche d'utilisateurs
     */
    public Page<UserDto> searchUsers(String search, Pageable pageable) {
        int skip = pageable.getPageNumber() * pageable.getPageSize();
        int limit = pageable.getPageSize();
        
        List<User> users = userRepository.searchUsersPaginated(search, skip, limit);
        long total = userRepository.count(); // Approximation pour la recherche
        
        List<UserDto> userDtos = users.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        return new PageImpl<>(userDtos, pageable, total);
    }
    
    /**
     * Active/désactive un utilisateur
     */
    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
        
        user.setEnabled(!user.getEnabled());
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    /**
     * Change le rôle d'un utilisateur
     */
    public UserDto changeUserRole(Long id, Role.RoleName roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID: " + id));
        
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Erreur: Rôle non trouvé."));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return convertToDto(updatedUser);
    }
    
    /**
     * Obtient les statistiques des utilisateurs
     */
    public Long getTotalUsers() {
        return userRepository.count();
    }
    
    public Long getActiveUsers() {
        return userRepository.countActiveUsers();
    }
    
    /**
     * Convertit une entité User en UserDto
     */
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setBio(user.getBio());
        dto.setProfileImage(user.getProfileImage());
        dto.setEnabled(user.getEnabled());
        dto.setRoleName(user.getRole().getName().name());
        // DateTime fields removed temporarily
        
        // Ajouter les IDs des livres favoris
        dto.setFavoriteBookIds(user.getFavorites().stream()
                .map(book -> book.getId())
                .collect(Collectors.toSet()));
        
        // Compter les téléchargements
        dto.setDownloadCount(user.getDownloadHistory().size());
        
        return dto;
    }
}