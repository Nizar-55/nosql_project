// ========================================
// REQUÊTES POUR CORRIGER LES RELATIONS DE FAVORIS
// ========================================

// 1. VÉRIFIER LES RELATIONS EXISTANTES
// Voir toutes les relations de favoris actuelles
MATCH ()-[r]->() 
WHERE type(r) IN ['FAVORITES', 'FAVORITED_BY']
RETURN type(r) as relationType, count(*) as count;

// 2. VOIR LES DÉTAILS DES RELATIONS FAVORITED_BY (à supprimer)
MATCH (u:User)-[r:FAVORITED_BY]->(b:Book)
RETURN u.username, b.title, type(r)
LIMIT 10;

// 3. VOIR LES DÉTAILS DES RELATIONS FAVORITES (à garder)
MATCH (u:User)-[r:FAVORITES]->(b:Book)
RETURN u.username, b.title, type(r)
LIMIT 10;

// 4. MIGRER LES RELATIONS FAVORITED_BY VERS FAVORITES (si nécessaire)
// Si des relations FAVORITED_BY existent, les convertir en FAVORITES
MATCH (u:User)-[old:FAVORITED_BY]->(b:Book)
WHERE NOT (u)-[:FAVORITES]->(b)
CREATE (u)-[:FAVORITES]->(b)
DELETE old;

// 5. SUPPRIMER TOUTES LES RELATIONS FAVORITED_BY RESTANTES
MATCH ()-[r:FAVORITED_BY]-()
DELETE r;

// 6. VÉRIFIER QUE SEULES LES RELATIONS FAVORITES EXISTENT
MATCH ()-[r]->() 
WHERE type(r) IN ['FAVORITES', 'FAVORITED_BY']
RETURN type(r) as relationType, count(*) as count;

// 7. CRÉER DES FAVORIS DE TEST (optionnel)
// Ajouter un favori de test pour l'utilisateur admin
MATCH (u:User {username: 'admin'}), (b:Book)
WHERE b.title IS NOT NULL AND NOT (u)-[:FAVORITES]->(b)
WITH u, b
LIMIT 1
CREATE (u)-[:FAVORITES]->(b)
RETURN u.username, b.title, 'FAVORITES créé' as action;

// 8. VÉRIFIER LES FAVORIS D'UN UTILISATEUR
// Requête pour récupérer les favoris d'un utilisateur (comme dans l'app)
MATCH (u:User {username: 'admin'})-[:FAVORITES]->(b:Book)
RETURN u.username, b.title, b.author
ORDER BY b.title;

// 9. STATISTIQUES DES FAVORIS
// Compter les favoris par utilisateur
MATCH (u:User)-[:FAVORITES]->(b:Book)
RETURN u.username, count(b) as favoriteCount
ORDER BY favoriteCount DESC;

// 10. VÉRIFIER L'INTÉGRITÉ DES DONNÉES
// S'assurer qu'il n'y a pas de doublons
MATCH (u:User)-[r:FAVORITES]->(b:Book)
WITH u, b, count(r) as relationCount
WHERE relationCount > 1
RETURN u.username, b.title, relationCount
LIMIT 10;

// 11. METTRE À JOUR LES COMPTEURS DE FAVORIS DANS LES LIVRES
// Recalculer le favoriteCount pour chaque livre
MATCH (b:Book)
OPTIONAL MATCH (u:User)-[:FAVORITES]->(b)
WITH b, count(u) as actualFavoriteCount
SET b.favoriteCount = actualFavoriteCount
RETURN b.title, b.favoriteCount
ORDER BY b.favoriteCount DESC
LIMIT 10;