// Script pour corriger les IDs des catégories et vérifier les relations

// 1. Vérifier l'état actuel des catégories
MATCH (c:Category)
RETURN c.name, c.id, ID(c) as internalId
ORDER BY c.name;

// 2. S'assurer que toutes les catégories ont une propriété id
MATCH (c:Category)
WHERE c.id IS NULL
SET c.id = ID(c);

// 3. Vérifier les relations livre-catégorie
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
RETURN b.title, c.name, c.id, b.available
LIMIT 10;

// 4. Compter les livres par catégorie avec les nouveaux IDs
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
WHERE b.available = true
RETURN c.name, c.id, count(b) as bookCount
ORDER BY c.name;

// 5. Test spécifique pour Science-Fiction
MATCH (c:Category {name: 'Science-Fiction'})
OPTIONAL MATCH (b:Book)-[:BELONGS_TO]->(c)
WHERE b.available = true
RETURN c.name, c.id, count(b) as sciFiBooks;