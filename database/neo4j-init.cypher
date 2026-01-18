// Script d'initialisation Neo4j pour Online Library Platform
// Exécutez ce script dans Neo4j Browser après le démarrage

// 1. Créer les contraintes d'unicité
CREATE CONSTRAINT unique_category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT unique_tag_name IF NOT EXISTS FOR (t:Tag) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT unique_user_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE;
CREATE CONSTRAINT unique_user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT unique_book_isbn IF NOT EXISTS FOR (b:Book) REQUIRE b.isbn IS UNIQUE;
CREATE CONSTRAINT unique_role_name IF NOT EXISTS FOR (r:Role) REQUIRE r.name IS UNIQUE;

// 2. Créer les index pour optimiser les performances
CREATE INDEX book_title_index IF NOT EXISTS FOR (b:Book) ON (b.title);
CREATE INDEX book_author_index IF NOT EXISTS FOR (b:Book) ON (b.author);
CREATE INDEX book_language_index IF NOT EXISTS FOR (b:Book) ON (b.language);
CREATE INDEX book_available_index IF NOT EXISTS FOR (b:Book) ON (b.available);
CREATE INDEX book_created_at_index IF NOT EXISTS FOR (b:Book) ON (b.createdAt);
CREATE INDEX user_enabled_index IF NOT EXISTS FOR (u:User) ON (u.enabled);

// 3. Créer les rôles
MERGE (adminRole:Role {name: 'ADMIN'})
SET adminRole.description = 'Administrateur avec tous les privilèges',
    adminRole.createdAt = datetime(),
    adminRole.updatedAt = datetime();

MERGE (userRole:Role {name: 'USER'})
SET userRole.description = 'Utilisateur standard avec accès limité',
    userRole.createdAt = datetime(),
    userRole.updatedAt = datetime();

// 4. Créer les catégories
MERGE (fiction:Category {name: 'Fiction'})
SET fiction.description = 'Romans et nouvelles de fiction',
    fiction.icon = 'book',
    fiction.color = '#3B82F6',
    fiction.createdAt = datetime(),
    fiction.updatedAt = datetime();

MERGE (scifi:Category {name: 'Science-Fiction'})
SET scifi.description = 'Littérature de science-fiction et fantasy',
    scifi.icon = 'rocket',
    scifi.color = '#8B5CF6',
    scifi.createdAt = datetime(),
    scifi.updatedAt = datetime();

MERGE (history:Category {name: 'Histoire'})
SET history.description = 'Livres d\'histoire et biographies',
    history.icon = 'clock',
    history.color = '#F59E0B',
    history.createdAt = datetime(),
    history.updatedAt = datetime();

MERGE (science:Category {name: 'Sciences'})
SET science.description = 'Livres scientifiques et techniques',
    science.icon = 'beaker',
    science.color = '#10B981',
    science.createdAt = datetime(),
    science.updatedAt = datetime();

MERGE (philosophy:Category {name: 'Philosophie'})
SET philosophy.description = 'Ouvrages de philosophie et réflexion',
    philosophy.icon = 'brain',
    philosophy.color = '#EF4444',
    philosophy.createdAt = datetime(),
    philosophy.updatedAt = datetime();

MERGE (art:Category {name: 'Art'})
SET art.description = 'Livres d\'art et de culture',
    art.icon = 'palette',
    art.color = '#EC4899',
    art.createdAt = datetime(),
    art.updatedAt = datetime();

MERGE (computer:Category {name: 'Informatique'})
SET computer.description = 'Programmation et technologies',
    computer.icon = 'computer',
    computer.color = '#6366F1',
    computer.createdAt = datetime(),
    computer.updatedAt = datetime();

MERGE (economy:Category {name: 'Économie'})
SET economy.description = 'Économie et gestion',
    economy.icon = 'trending-up',
    economy.color = '#F97316',
    economy.createdAt = datetime(),
    economy.updatedAt = datetime();

// 5. Créer les tags
MERGE (bestseller:Tag {name: 'Bestseller'})
SET bestseller.description = 'Livre populaire',
    bestseller.color = '#FFD700',
    bestseller.createdAt = datetime(),
    bestseller.updatedAt = datetime();

MERGE (nouveau:Tag {name: 'Nouveau'})
SET nouveau.description = 'Récemment ajouté',
    nouveau.color = '#00FF00',
    nouveau.createdAt = datetime(),
    nouveau.updatedAt = datetime();

MERGE (classique:Tag {name: 'Classique'})
SET classique.description = 'Œuvre classique',
    classique.color = '#8B4513',
    classique.createdAt = datetime(),
    classique.updatedAt = datetime();

MERGE (recommande:Tag {name: 'Recommandé'})
SET recommande.description = 'Recommandé par la communauté',
    recommande.color = '#FF6347',
    recommande.createdAt = datetime(),
    recommande.updatedAt = datetime();

MERGE (gratuit:Tag {name: 'Gratuit'})
SET gratuit.description = 'Livre gratuit',
    gratuit.color = '#32CD32',
    gratuit.createdAt = datetime(),
    gratuit.updatedAt = datetime();

MERGE (premium:Tag {name: 'Premium'})
SET premium.description = 'Contenu premium',
    premium.color = '#FFD700',
    premium.createdAt = datetime(),
    premium.updatedAt = datetime();

// 6. Créer l'utilisateur administrateur par défaut
MATCH (adminRole:Role {name: 'ADMIN'})
MERGE (admin:User {username: 'admin'})
SET admin.email = 'admin@library.com',
    admin.password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    admin.firstName = 'Admin',
    admin.lastName = 'System',
    admin.enabled = true,
    admin.downloadCount = 0,
    admin.createdAt = datetime(),
    admin.updatedAt = datetime()
MERGE (admin)-[:HAS_ROLE]->(adminRole);

// 7. Créer quelques livres d'exemple
MATCH (fiction:Category {name: 'Fiction'})
MATCH (bestseller:Tag {name: 'Bestseller'})
MATCH (classique:Tag {name: 'Classique'})
CREATE (book1:Book {
    title: 'Les Misérables',
    author: 'Victor Hugo',
    isbn: '978-2-07-040570-1',
    description: 'Un chef-d\'œuvre de la littérature française qui suit la vie de Jean Valjean.',
    publicationYear: 1862,
    pageCount: 1232,
    language: 'Français',
    downloadCount: 150,
    favoriteCount: 45,
    available: true,
    createdAt: datetime(),
    updatedAt: datetime()
})
CREATE (book1)-[:BELONGS_TO]->(fiction)
CREATE (book1)-[:HAS_TAG]->(bestseller)
CREATE (book1)-[:HAS_TAG]->(classique);

MATCH (scifi:Category {name: 'Science-Fiction'})
MATCH (nouveau:Tag {name: 'Nouveau'})
CREATE (book2:Book {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-2-266-11042-2',
    description: 'Une épopée de science-fiction sur la planète désertique Arrakis.',
    publicationYear: 1965,
    pageCount: 688,
    language: 'Français',
    downloadCount: 89,
    favoriteCount: 32,
    available: true,
    createdAt: datetime(),
    updatedAt: datetime()
})
CREATE (book2)-[:BELONGS_TO]->(scifi)
CREATE (book2)-[:HAS_TAG]->(nouveau);

MATCH (computer:Category {name: 'Informatique'})
MATCH (recommande:Tag {name: 'Recommandé'})
CREATE (book3:Book {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0-13-235088-4',
    description: 'Un guide pour écrire du code propre et maintenable.',
    publicationYear: 2008,
    pageCount: 464,
    language: 'Anglais',
    downloadCount: 234,
    favoriteCount: 78,
    available: true,
    createdAt: datetime(),
    updatedAt: datetime()
})
CREATE (book3)-[:BELONGS_TO]->(computer)
CREATE (book3)-[:HAS_TAG]->(recommande);

// 8. Afficher un résumé de l'initialisation
MATCH (c:Category) WITH count(c) as categories
MATCH (t:Tag) WITH categories, count(t) as tags
MATCH (b:Book) WITH categories, tags, count(b) as books
MATCH (u:User) WITH categories, tags, books, count(u) as users
MATCH (r:Role) WITH categories, tags, books, users, count(r) as roles
RETURN 
    categories + ' catégories créées' as Categories,
    tags + ' tags créés' as Tags,
    books + ' livres d\'exemple créés' as Books,
    users + ' utilisateurs créés' as Users,
    roles + ' rôles créés' as Roles;