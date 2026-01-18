package com.library.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration Swagger/OpenAPI pour la documentation de l'API
 */
@Configuration
public class OpenApiConfig {
    
    @Value("${app.openapi.dev-url:http://localhost:8080}")
    private String devUrl;
    
    @Value("${app.openapi.prod-url:https://library.example.com}")
    private String prodUrl;
    
    @Bean
    public OpenAPI myOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl(devUrl);
        devServer.setDescription("Serveur de développement");
        
        Server prodServer = new Server();
        prodServer.setUrl(prodUrl);
        prodServer.setDescription("Serveur de production");
        
        Contact contact = new Contact();
        contact.setEmail("admin@library.com");
        contact.setName("Équipe Library");
        contact.setUrl("https://library.example.com");
        
        License mitLicense = new License()
            .name("MIT License")
            .url("https://choosealicense.com/licenses/mit/");
        
        Info info = new Info()
            .title("Online Library Platform API")
            .version("1.0")
            .contact(contact)
            .description("API complète pour la plateforme de bibliothèque en ligne. " +
                        "Cette API fournit tous les endpoints nécessaires pour gérer les livres, " +
                        "utilisateurs, catégories, tags, favoris, téléchargements et recommandations.")
            .termsOfService("https://library.example.com/terms")
            .license(mitLicense);
        
        return new OpenAPI()
            .info(info)
            .servers(List.of(devServer, prodServer))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .name("bearerAuth")
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT token pour l'authentification. " +
                               "Format: Bearer {token}")
                )
            );
    }
}