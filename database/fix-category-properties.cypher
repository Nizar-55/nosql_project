// Corriger les propriétés id des catégories

// 1. Ajouter la propriété id à toutes les catégories
MATCH (c:Category)
SET c.id = ID(c);

// 2. Vérifier que les IDs ont été ajoutés
MATCH (c:Category)
RETURN c.name, c.id, ID(c) as internalId
ORDER BY c.name;

// 3. Tester le filtre Science-Fiction avec la nouvelle propriété
MATCH (b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
WHERE b.available = true 
  AND c.id = 7  // ID de Science-Fiction
RETURN DISTINCT b.title, b.author, c.name as category;

// 4. Compter les livres Science-Fiction
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
WHERE b.available = true AND c.id = 7
RETURN count(b) as sciFiBooks;