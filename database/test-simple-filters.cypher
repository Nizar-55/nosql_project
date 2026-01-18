// Test des filtres simplifiés

// 1. Vérifier l'ID de Science-Fiction
MATCH (c:Category {name: 'Science-Fiction'})
RETURN c.id, c.name;

// 2. Test du filtre catégorie avec EXISTS (comme dans le nouveau code)
MATCH (b:Book)
WHERE b.available = true 
  AND EXISTS { 
    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = 7 
  }
RETURN b.title, b.author
LIMIT 5;

// 3. Compter les livres Science-Fiction avec la nouvelle méthode
MATCH (b:Book)
WHERE b.available = true 
  AND EXISTS { 
    MATCH (b)-[:BELONGS_TO]->(c:Category) WHERE c.id = 7 
  }
RETURN count(b) as sciFiCount;

// 4. Vérifier tous les livres disponibles pour comparaison
MATCH (b:Book)
WHERE b.available = true
RETURN count(b) as totalBooks;