// ========================================
// REQUÊTES POUR CORRIGER LES FILTRES DE LIVRES
// ========================================

// 1. VÉRIFIER LES DONNÉES EXISTANTES
// Voir tous les livres et leurs relations
MATCH (b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
RETURN b.id, b.title, b.author, b.language, b.publicationYear, b.available, 
       c.id as categoryId, c.name as categoryName
ORDER BY b.title
LIMIT 10;

// 2. VÉRIFIER LES LIVRES SANS CATÉGORIE
MATCH (b:Book)
WHERE NOT (b)-[:BELONGS_TO]->(:Category)
RETURN count(b) as livresSansCategorie;

// 3. VÉRIFIER LES CATÉGORIES EXISTANTES
MATCH (c:Category)
OPTIONAL MATCH (c)<-[:BELONGS_TO]-(b:Book)
RETURN c.id, c.name, count(b) as nombreLivres
ORDER BY c.name;

// 4. CORRIGER LES LIVRES SANS CATÉGORIE (assigner une catégorie par défaut)
// D'abord, créer une catégorie "Général" si elle n'existe pas
MERGE (c:Category {name: 'Général'})
ON CREATE SET c.description = 'Catégorie générale pour les livres non classés'
RETURN c;

// Assigner la catégorie "Général" aux livres sans catégorie
MATCH (b:Book)
WHERE NOT (b)-[:BELONGS_TO]->(:Category)
WITH b
MATCH (c:Category {name: 'Général'})
CREATE (b)-[:BELONGS_TO]->(c)
RETURN count(b) as livresCorrigés;

// 5. VÉRIFIER LES PROPRIÉTÉS DES LIVRES
MATCH (b:Book)
RETURN 
  count(b) as totalLivres,
  count(b.title) as avecTitre,
  count(b.author) as avecAuteur,
  count(b.language) as avecLangue,
  count(b.publicationYear) as avecAnnee,
  sum(CASE WHEN b.available = true THEN 1 ELSE 0 END) as disponibles;

// 6. CRÉER DES DONNÉES DE TEST SI NÉCESSAIRE
// Créer quelques livres de test avec différentes propriétés
MERGE (c1:Category {name: 'Fiction'})
ON CREATE SET c1.description = 'Romans et nouvelles'

MERGE (c2:Category {name: 'Science-Fiction'})
ON CREATE SET c2.description = 'Science-fiction et fantasy'

MERGE (c3:Category {name: 'Histoire'})
ON CREATE SET c3.description = 'Livres d\'histoire'

// Créer des livres de test
CREATE (b1:Book {
  title: 'Test Livre Fiction',
  author: 'Auteur Test',
  language: 'Français',
  publicationYear: 2020,
  available: true,
  createdAt: datetime(),
  updatedAt: datetime(),
  downloadCount: 0,
  favoriteCount: 0
})
CREATE (b1)-[:BELONGS_TO]->(c1)

CREATE (b2:Book {
  title: 'Test Science Fiction Book',
  author: 'Test Author',
  language: 'Anglais',
  publicationYear: 2021,
  available: true,
  createdAt: datetime(),
  updatedAt: datetime(),
  downloadCount: 5,
  favoriteCount: 2
})
CREATE (b2)-[:BELONGS_TO]->(c2)

CREATE (b3:Book {
  title: 'Histoire de Test',
  author: 'Historien Test',
  language: 'Français',
  publicationYear: 1995,
  available: true,
  createdAt: datetime(),
  updatedAt: datetime(),
  downloadCount: 10,
  favoriteCount: 3
})
CREATE (b3)-[:BELONGS_TO]->(c3)

RETURN 'Livres de test créés' as message;

// 7. TESTER LES REQUÊTES DE FILTRAGE
// Test 1: Filtrer par catégorie
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
WHERE c.name = 'Fiction' AND b.available = true
RETURN b.title, c.name;

// Test 2: Filtrer par langue
MATCH (b:Book)
WHERE b.language = 'Français' AND b.available = true
RETURN b.title, b.language;

// Test 3: Filtrer par année
MATCH (b:Book)
WHERE b.publicationYear >= 2000 AND b.available = true
RETURN b.title, b.publicationYear;

// Test 4: Filtrer par auteur (recherche partielle)
MATCH (b:Book)
WHERE toLower(b.author) CONTAINS toLower('test') AND b.available = true
RETURN b.title, b.author;

// 8. VÉRIFIER LA REQUÊTE COMPLÈTE DE FILTRAGE
MATCH (b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
OPTIONAL MATCH (b)-[:HAS_TAG]->(t:Tag)
WHERE b.available = true
  AND (c.name = 'Fiction' OR c.name IS NULL)
  AND (b.language = 'Français' OR b.language IS NULL)
RETURN DISTINCT b.title, b.author, b.language, c.name as category
LIMIT 10;

// 9. STATISTIQUES FINALES
MATCH (b:Book)
WHERE b.available = true
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
RETURN 
  count(b) as totalLivresDisponibles,
  count(DISTINCT c) as nombreCategories,
  count(DISTINCT b.language) as nombreLangues,
  min(b.publicationYear) as anneeMin,
  max(b.publicationYear) as anneeMax;