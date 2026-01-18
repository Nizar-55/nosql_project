// Script pour vider complètement la base de données Neo4j
// Exécutez ce script dans Neo4j Browser pour repartir à zéro

// 1. Supprimer toutes les relations
MATCH ()-[r]-() DELETE r;

// 2. Supprimer tous les nœuds
MATCH (n) DELETE n;

// 3. Supprimer toutes les contraintes
CALL apoc.schema.assert({},{},true) YIELD label, key
RETURN label, key;

// Alternative si APOC n'est pas disponible:
// DROP CONSTRAINT unique_category_name IF EXISTS;
// DROP CONSTRAINT unique_tag_name IF EXISTS;
// DROP CONSTRAINT unique_user_username IF EXISTS;
// DROP CONSTRAINT unique_user_email IF EXISTS;
// DROP CONSTRAINT unique_book_isbn IF EXISTS;
// DROP CONSTRAINT unique_role_name IF EXISTS;

// 4. Supprimer tous les index
CALL db.indexes() YIELD name
CALL db.index.drop(name) YIELD name as droppedIndex
RETURN droppedIndex;

// 5. Vérifier que la base est vide
MATCH (n) RETURN count(n) as remaining_nodes;