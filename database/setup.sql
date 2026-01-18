-- Script de création de la base de données pour Online Library Platform
-- Exécutez ce script en tant qu'administrateur PostgreSQL

-- 1. Créer la base de données
CREATE DATABASE online_library
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'French_France.1252'
    LC_CTYPE = 'French_France.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER library_user WITH PASSWORD 'library_password_2024';

-- 3. Accorder les privilèges
GRANT ALL PRIVILEGES ON DATABASE online_library TO library_user;

-- 4. Se connecter à la base de données
\c online_library;

-- 5. Accorder les privilèges sur le schéma public
GRANT ALL ON SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO library_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO library_user;

-- 6. Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Pour la recherche textuelle

-- 7. Données initiales - Rôles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Administrateur avec tous les privilèges'),
('USER', 'Utilisateur standard avec accès limité')
ON CONFLICT (name) DO NOTHING;

-- 8. Données initiales - Catégories
INSERT INTO categories (name, description, icon, color) VALUES 
('Fiction', 'Romans et nouvelles de fiction', 'book', '#3B82F6'),
('Science-Fiction', 'Littérature de science-fiction et fantasy', 'rocket', '#8B5CF6'),
('Histoire', 'Livres d''histoire et biographies', 'clock', '#F59E0B'),
('Sciences', 'Livres scientifiques et techniques', 'beaker', '#10B981'),
('Philosophie', 'Ouvrages de philosophie et réflexion', 'brain', '#EF4444'),
('Art', 'Livres d''art et de culture', 'palette', '#EC4899'),
('Informatique', 'Programmation et technologies', 'computer', '#6366F1'),
('Économie', 'Économie et gestion', 'trending-up', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- 9. Données initiales - Tags
INSERT INTO tags (name, description, color) VALUES 
('Bestseller', 'Livre populaire', '#FFD700'),
('Nouveau', 'Récemment ajouté', '#00FF00'),
('Classique', 'Œuvre classique', '#8B4513'),
('Recommandé', 'Recommandé par la communauté', '#FF6347'),
('Gratuit', 'Livre gratuit', '#32CD32'),
('Premium', 'Contenu premium', '#FFD700')
ON CONFLICT (name) DO NOTHING;

-- 10. Utilisateur administrateur par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT INTO users (username, email, password, first_name, last_name, enabled, role_id, created_at, updated_at) 
SELECT 
    'admin',
    'admin@library.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',  -- admin123
    'Admin',
    'System',
    true,
    r.id,
    NOW(),
    NOW()
FROM roles r 
WHERE r.name = 'ADMIN'
ON CONFLICT (username) DO NOTHING;

-- 11. Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON books USING gin(to_tsvector('french', author));
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_download_history_user ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_book ON download_history(book_id);

COMMENT ON DATABASE online_library IS 'Base de données pour la plateforme de bibliothèque en ligne';