package com.library.security;

import com.library.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Configuration de sécurité Spring Security
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;
    
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;
    
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }
    
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(httpBasic -> httpBasic.disable()) // Désactiver explicitement l'authentification Basic
            .formLogin(formLogin -> formLogin.disable()) // Désactiver le formulaire de login par défaut
            .logout(logout -> logout.disable()) // Désactiver la déconnexion par défaut
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/test/**").permitAll() // Endpoints de test
                    .requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/books").permitAll() // GET books publique
                    .requestMatchers("/books/{id}").permitAll() // GET book by ID publique
                    .requestMatchers("/books/search").permitAll() // Search publique
                    .requestMatchers("/books/test/**").permitAll() // Endpoints de test des livres
                    .requestMatchers("/books/category/**").permitAll() // Books by category publique
                    .requestMatchers("/categories/**").permitAll() // Lecture publique des catégories
                    .requestMatchers("/tags/**").permitAll() // Lecture publique des tags
                    .requestMatchers("/recommendations/trending").permitAll() // Tendances publiques
                    .requestMatchers("/files/**").permitAll() // Fichiers publics
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                    .requestMatchers("/uploads/**").permitAll()
                    .requestMatchers("/error").permitAll() // Permettre les pages d'erreur
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    .requestMatchers("/analytics/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}