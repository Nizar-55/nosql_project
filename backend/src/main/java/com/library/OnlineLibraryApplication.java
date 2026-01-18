package com.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.neo4j.config.EnableNeo4jAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Application principale de la plateforme de bibliothèque en ligne
 * 
 * @author Library Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableNeo4jAuditing
@EnableAsync
public class OnlineLibraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineLibraryApplication.class, args);
    }
}