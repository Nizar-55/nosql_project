-- Script d'initialisation des données de test pour la bibliothèque en ligne
-- Ce script sera exécuté automatiquement au démarrage de l'application

-- Insertion des rôles
INSERT INTO roles (name, description, created_at, updated_at) VALUES 
('ROLE_ADMIN', 'Administrateur avec tous les privilèges', NOW(), NOW()),
('ROLE_USER', 'Utilisateur standard', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insertion des catégories
INSERT INTO categories (name, description, color, icon, created_at, updated_at) VALUES 
('Science Fiction', 'Livres de science-fiction et fantasy', '#3B82F6', 'rocket', NOW(), NOW()),
('Romance', 'Romans d''amour et relations', '#EC4899', 'heart', NOW(), NOW()),
('Thriller', 'Suspense et thrillers', '#EF4444', 'zap', NOW(), NOW()),
('Histoire', 'Livres d''histoire et biographies', '#8B5CF6', 'clock', NOW(), NOW()),
('Science', 'Sciences et technologies', '#10B981', 'atom', NOW(), NOW()),
('Philosophie', 'Philosophie et pensée', '#F59E0B', 'brain', NOW(), NOW()),
('Littérature', 'Littérature classique et contemporaine', '#6366F1', 'book-open', NOW(), NOW()),
('Développement Personnel', 'Croissance personnelle et bien-être', '#14B8A6', 'trending-up', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insertion des tags
INSERT INTO tags (name, description, color, created_at, updated_at) VALUES 
('Bestseller', 'Livre à succès', '#FFD700', NOW(), NOW()),
('Nouveau', 'Récemment ajouté', '#00FF00', NOW(), NOW()),
('Classique', 'Œuvre classique intemporelle', '#8B4513', NOW(), NOW()),
('Prix Littéraire', 'Récompensé par un prix littéraire', '#FF6347', NOW(), NOW()),
('Adaptation Cinéma', 'Adapté au cinéma', '#4169E1', NOW(), NOW()),
('Série', 'Fait partie d''une série', '#9932CC', NOW(), NOW()),
('Jeune Adulte', 'Destiné aux jeunes adultes', '#FF69B4', NOW(), NOW()),
('Biographie', 'Récit biographique', '#2E8B57', NOW(), NOW()),
('Essai', 'Essai ou analyse', '#B8860B', NOW(), NOW()),
('Humour', 'Livre humoristique', '#FFA500', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (username, email, password, first_name, last_name, enabled, role_id, created_at, updated_at)
SELECT 
    'admin',
    'admin@library.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Admin',
    'System',
    true,
    r.id,
    NOW(),
    NOW()
FROM roles r 
WHERE r.name = 'ROLE_ADMIN'
ON CONFLICT (username) DO NOTHING;

-- Insertion d'un utilisateur test
INSERT INTO users (username, email, password, first_name, last_name, enabled, role_id, created_at, updated_at)
SELECT 
    'testuser',
    'test@library.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Test',
    'User',
    true,
    r.id,
    NOW(),
    NOW()
FROM roles r 
WHERE r.name = 'ROLE_USER'
ON CONFLICT (username) DO NOTHING;

-- Insertion de livres d'exemple
INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Dune',
    'Frank Herbert',
    '978-0441013593',
    'Sur la planète désertique d''Arrakis, Paul Atréides mène une guerre sainte à travers l''univers. Dune est un chef-d''œuvre de la science-fiction.',
    1965,
    688,
    'Français',
    1250,
    89,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Science Fiction'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Le Seigneur des Anneaux',
    'J.R.R. Tolkien',
    '978-2070612888',
    'L''épopée fantastique de Frodon et de la Communauté de l''Anneau dans leur quête pour détruire l''Anneau Unique.',
    1954,
    1216,
    'Français',
    2100,
    156,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Science Fiction'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Orgueil et Préjugés',
    'Jane Austen',
    '978-2070413812',
    'L''histoire d''amour entre Elizabeth Bennet et Mr. Darcy, un classique de la littérature romantique.',
    1813,
    448,
    'Français',
    890,
    134,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Romance'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Gone Girl',
    'Gillian Flynn',
    '978-0307588371',
    'Un thriller psychologique sur la disparition d''Amy Dunne et les soupçons qui pèsent sur son mari Nick.',
    2012,
    432,
    'Français',
    1567,
    203,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Thriller'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Sapiens',
    'Yuval Noah Harari',
    '978-2226257017',
    'Une brève histoire de l''humanité, de l''âge de pierre à l''ère numérique.',
    2011,
    512,
    'Français',
    2340,
    287,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Histoire'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Une brève histoire du temps',
    'Stephen Hawking',
    '978-2081229105',
    'Les mystères de l''univers expliqués par l''un des plus grands physiciens de notre temps.',
    1988,
    256,
    'Français',
    1876,
    198,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Science'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Méditations',
    'Marc Aurèle',
    '978-2080712059',
    'Les réflexions philosophiques de l''empereur romain Marc Aurèle sur la vie, la mort et la vertu.',
    180,
    192,
    'Français',
    756,
    89,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Philosophie'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Les Misérables',
    'Victor Hugo',
    '978-2070409228',
    'L''épopée de Jean Valjean dans la France du XIXe siècle, un monument de la littérature française.',
    1862,
    1664,
    'Français',
    1234,
    167,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Littérature'
ON CONFLICT (isbn) DO NOTHING;

INSERT INTO books (title, author, isbn, description, publication_year, page_count, language, download_count, favorite_count, available, category_id, created_at, updated_at)
SELECT 
    'Atomic Habits',
    'James Clear',
    '978-0735211292',
    'Un guide pratique pour créer de bonnes habitudes et se défaire des mauvaises.',
    2018,
    320,
    'Français',
    3456,
    412,
    true,
    c.id,
    NOW(),
    NOW()
FROM categories c WHERE c.name = 'Développement Personnel'
ON CONFLICT (isbn) DO NOTHING;

-- Association des tags aux livres (exemples)
INSERT INTO book_tags (book_id, tag_id)
SELECT b.id, t.id
FROM books b, tags t
WHERE b.title = 'Dune' AND t.name IN ('Classique', 'Adaptation Cinéma', 'Série')
ON CONFLICT DO NOTHING;

INSERT INTO book_tags (book_id, tag_id)
SELECT b.id, t.id
FROM books b, tags t
WHERE b.title = 'Le Seigneur des Anneaux' AND t.name IN ('Classique', 'Adaptation Cinéma', 'Série', 'Bestseller')
ON CONFLICT DO NOTHING;

INSERT INTO book_tags (book_id, tag_id)
SELECT b.id, t.id
FROM books b, tags t
WHERE b.title = 'Gone Girl' AND t.name IN ('Bestseller', 'Adaptation Cinéma')
ON CONFLICT DO NOTHING;

INSERT INTO book_tags (book_id, tag_id)
SELECT b.id, t.id
FROM books b, tags t
WHERE b.title = 'Sapiens' AND t.name IN ('Bestseller', 'Essai')
ON CONFLICT DO NOTHING;

INSERT INTO book_tags (book_id, tag_id)
SELECT b.id, t.id
FROM books b, tags t
WHERE b.title = 'Atomic Habits' AND t.name IN ('Bestseller', 'Nouveau')
ON CONFLICT DO NOTHING;