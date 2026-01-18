// Test final des filtres simplifiés

// 1. Vérifier que les catégories ont bien des propriétés id
MATCH (c:Category)
RETURN c.name, c.id, ID(c) as internalId
ORDER BY c.name;

// 2. Test du filtre Science-Fiction (ID = 7)
MATCH (b:Book)
WHERE b.available = true 
  AND EXISTS { 
    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = 7 
  }
RETURN b.title, b.author;

// 3. Compter les livres Science-Fiction
MATCH (b:Book)
WHERE b.available = true 
  AND EXISTS { 
    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = 7 
  }
RETURN count(b) as sciFiBooks;

// 4. Vérifier tous les livres disponibles
MATCH (b:Book)
WHERE b.available = true
RETURN count(b) as totalBooks;