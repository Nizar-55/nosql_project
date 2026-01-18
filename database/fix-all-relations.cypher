// ========================================
// REQUÊTES POUR CORRIGER TOUTES LES RELATIONS
// ========================================

// 1. NETTOYER LES ANCIENNES RELATIONS INCORRECTES
// Supprimer toutes les relations DOWNLOADED (incorrectes)
MATCH ()-[r:DOWNLOADED]-() 
DELETE r;

// Supprimer toutes les relations FAVORITED_BY (redondantes)
MATCH ()-[r:FAVORITED_BY]-()
DELETE r;

// 2. VÉRIFIER LES DONNÉES EXISTANTES
// Voir tous les DownloadHistory existants
MATCH (dh:DownloadHistory) 
RETURN dh.id, dh.downloadedAt, dh.ipAddress 
ORDER BY dh.downloadedAt DESC 
LIMIT 10;

// 3. VÉRIFIER LES RELATIONS EXISTANTES
// Voir les relations des DownloadHistory
MATCH (dh:DownloadHistory)-[r]->(n) 
RETURN type(r) as relationType, labels(n) as targetLabels, count(*) as count;

// Voir les relations de favoris
MATCH ()-[r]->() 
WHERE type(r) IN ['FAVORITES', 'FAVORITED_BY']
RETURN type(r) as relationType, count(*) as count;

// 4. CORRIGER LES RELATIONS MANQUANTES (si nécessaire)
// Si des DownloadHistory existent sans relations, les supprimer
MATCH (dh:DownloadHistory) 
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User) OR NOT (dh)-[:OF_BOOK]->(:Book)
DELETE dh;

// 5. METTRE À JOUR LES COMPTEURS
// Recalculer le favoriteCount pour chaque livre
MATCH (b:Book)
OPTIONAL MATCH (u:User)-[:FAVORITES]->(b)
WITH b, count(u) as actualFavoriteCount
SET b.favoriteCount = actualFavoriteCount;

// 6. CRÉER DES DONNÉES DE TEST (optionnel)
// Créer un téléchargement de test pour l'utilisateur admin
MATCH (u:User {username: 'admin'}), (b:Book)
WHERE b.title IS NOT NULL
WITH u, b
LIMIT 1
CREATE (dh:DownloadHistory {
    downloadedAt: datetime(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser'
})
CREATE (dh)-[:DOWNLOADED_BY]->(u)
CREATE (dh)-[:OF_BOOK]->(b)
RETURN dh, u.username, b.title;

// Créer un favori de test pour l'utilisateur admin
MATCH (u:User {username: 'admin'}), (b:Book)
WHERE b.title IS NOT NULL AND NOT (u)-[:FAVORITES]->(b)
WITH u, b
LIMIT 1
CREATE (u)-[:FAVORITES]->(b)
RETURN u.username, b.title, 'FAVORITES créé' as action;

// 7. VÉRIFIER QUE TOUT FONCTIONNE
// Requête pour récupérer l'historique d'un utilisateur (comme dans l'app)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN dh.id, dh.downloadedAt, b.title, b.author
ORDER BY dh.downloadedAt DESC;

// Requête pour récupérer les favoris d'un utilisateur (comme dans l'app)
MATCH (u:User {username: 'admin'})-[:FAVORITES]->(b:Book)
RETURN u.username, b.title, b.author
ORDER BY b.title;

// 8. STATISTIQUES
// Compter les téléchargements par utilisateur
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
RETURN u.username, count(dh) as downloadCount
ORDER BY downloadCount DESC;

// Compter les favoris par utilisateur
MATCH (u:User)-[:FAVORITES]->(b:Book)
RETURN u.username, count(b) as favoriteCount
ORDER BY favoriteCount DESC;

// 9. VÉRIFIER L'INTÉGRITÉ DES DONNÉES
// S'assurer que tous les DownloadHistory ont les bonnes relations
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WHERE u IS NULL OR b IS NULL
RETURN dh.id, u.username, b.title
LIMIT 10;

// S'assurer qu'il n'y a pas de doublons dans les favoris
MATCH (u:User)-[r:FAVORITES]->(b:Book)
WITH u, b, count(r) as relationCount
WHERE relationCount > 1
RETURN u.username, b.title, relationCount
LIMIT 10;