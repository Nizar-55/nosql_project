// ========================================
// SCRIPT POUR CORRIGER LES RELATIONS DOWNLOAD HISTORY
// ========================================

// 1. DIAGNOSTIC - Voir l'état actuel
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt as downloadDate,
    u.username as username,
    b.title as bookTitle,
    CASE WHEN u IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasUser,
    CASE WHEN b IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasBook
ORDER BY dh.downloadedAt DESC;

// 2. COMPTER LES PROBLÈMES
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WITH 
    count(dh) as totalDownloads,
    count(u) as downloadsWithUser,
    count(b) as downloadsWithBook
RETURN 
    totalDownloads,
    downloadsWithUser,
    downloadsWithBook,
    totalDownloads - downloadsWithUser as downloadsWithoutUser,
    totalDownloads - downloadsWithBook as downloadsWithoutBook;

// 3. SUPPRIMER LES DOWNLOAD HISTORY ORPHELINS (sans utilisateur)
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User)
DELETE dh;

// 4. POUR LES DOWNLOAD HISTORY SANS LIVRE, ESSAYER DE LES LIER AU PREMIER LIVRE DISPONIBLE
// (C'est une solution temporaire - idéalement il faudrait connaître quel livre a été téléchargé)
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WHERE b.available = true
WITH dh, b
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b)
RETURN dh.id, b.title, 'Relation OF_BOOK créée' as action;

// 5. ALTERNATIVE: CRÉER DES TÉLÉCHARGEMENTS DE TEST AVEC TOUTES LES RELATIONS
// Supprimer d'abord les anciens téléchargements de test (avec DETACH DELETE)
MATCH (dh:DownloadHistory)
WHERE dh.userAgent = 'Test Browser'
DETACH DELETE dh;

// Créer des téléchargements de test complets pour l'admin
MATCH (admin:User {username: 'admin'}), (book:Book)
WHERE book.available = true
WITH admin, book
LIMIT 3
CREATE (dh:DownloadHistory {
    downloadedAt: datetime(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser - Fixed Relations'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, admin.username, book.title, 'Téléchargement de test créé' as action;

// 6. VÉRIFICATION FINALE
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    u.username,
    count(dh) as totalDownloads,
    count(b) as downloadsWithBooks,
    count(dh) - count(b) as downloadsWithoutBooks
ORDER BY u.username;

// 7. AFFICHER QUELQUES EXEMPLES COMPLETS
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    u.username,
    b.title,
    b.author
ORDER BY dh.downloadedAt DESC
LIMIT 5;

// 8. METTRE À JOUR LES COMPTEURS DE TÉLÉCHARGEMENT DES LIVRES
MATCH (b:Book)
OPTIONAL MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b)
WITH b, count(dh) as actualDownloadCount
SET b.downloadCount = actualDownloadCount
RETURN b.title, b.downloadCount, actualDownloadCount;