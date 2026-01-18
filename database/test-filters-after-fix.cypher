// Test des filtres après correction des IDs

// 1. Récupérer l'ID de Science-Fiction
MATCH (c:Category {name: 'Science-Fiction'})
RETURN c.id as sciFiId, c.name;

// 2. Tester le filtre par catégorie (simulation de la requête du repository)
MATCH (b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
WHERE b.available = true 
  AND c.id = 1  // Remplacer par l'ID réel de Science-Fiction
RETURN DISTINCT b.title, b.author, c.name as category
LIMIT 5;

// 3. Tester avec tous les livres disponibles pour comparaison
MATCH (b:Book)
WHERE b.available = true
RETURN count(b) as totalAvailableBooks;

// 4. Tester le filtre Science-Fiction spécifiquement
MATCH (b:Book)-[:BELONGS_TO]->(c:Category {name: 'Science-Fiction'})
WHERE b.available = true
RETURN b.title, b.author, b.description
LIMIT 5;

// 5. Vérifier si tous les livres ont bien une catégorie
MATCH (b:Book)
WHERE b.available = true
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
RETURN 
  count(b) as totalBooks,
  count(c) as booksWithCategory,
  count(b) - count(c) as booksWithoutCategory;