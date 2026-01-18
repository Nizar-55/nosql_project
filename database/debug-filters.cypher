// Script de diagnostic pour les filtres

// 1. Vérifier les catégories et leurs IDs
MATCH (c:Category)
RETURN ID(c) as categoryId, c.name as categoryName, c.description
ORDER BY c.name;

// 2. Vérifier les livres et leurs relations avec les catégories
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
RETURN b.title, b.author, c.name as category, ID(c) as categoryId, b.available
LIMIT 10;

// 3. Compter les livres par catégorie
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
WHERE b.available = true
RETURN c.name as category, ID(c) as categoryId, count(b) as bookCount
ORDER BY c.name;

// 4. Tester le filtre Science-Fiction spécifiquement
MATCH (c:Category {name: 'Science-Fiction'})
MATCH (b:Book)-[:BELONGS_TO]->(c)
WHERE b.available = true
RETURN ID(c) as sciFiCategoryId, count(b) as sciFiBooksCount;

// 5. Lister les livres Science-Fiction
MATCH (c:Category {name: 'Science-Fiction'})
MATCH (b:Book)-[:BELONGS_TO]->(c)
WHERE b.available = true
RETURN b.title, b.author, b.available
LIMIT 5;