// ========================================
// REQUÊTES POUR CORRIGER L'HISTORIQUE DES TÉLÉCHARGEMENTS
// ========================================

// 1. NETTOYER LES ANCIENNES RELATIONS INCORRECTES
// Supprimer toutes les relations DOWNLOADED (incorrectes)
MATCH ()-[r:DOWNLOADED]-() 
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

// 4. CORRIGER LES RELATIONS MANQUANTES (si nécessaire)
// Si des DownloadHistory existent sans relations, les supprimer
MATCH (dh:DownloadHistory) 
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User) OR NOT (dh)-[:OF_BOOK]->(:Book)
DELETE dh;

// 5. CRÉER DES DONNÉES DE TEST (optionnel)
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

// 6. VÉRIFIER QUE TOUT FONCTIONNE
// Requête pour récupérer l'historique d'un utilisateur (comme dans l'app)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN dh.id, dh.downloadedAt, b.title, b.author
ORDER BY dh.downloadedAt DESC;

// 7. STATISTIQUES
// Compter les téléchargements par utilisateur
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
RETURN u.username, count(dh) as downloadCount
ORDER BY downloadCount DESC;

// 8. VÉRIFIER L'INTÉGRITÉ DES DONNÉES
// S'assurer que tous les DownloadHistory ont les bonnes relations
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WHERE u IS NULL OR b IS NULL
RETURN dh.id, u.username, b.title
LIMIT 1