// ========================================
// CORRECTION PROGRESSIVE DES TÉLÉCHARGEMENTS
// Exécutez ces requêtes UNE PAR UNE dans Neo4j Browser
// ========================================

// ÉTAPE 1: DIAGNOSTIC INITIAL
// Voir l'état actuel des téléchargements
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt as downloadDate,
    dh.userAgent as userAgent,
    u.username as username,
    b.title as bookTitle,
    CASE WHEN u IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasUser,
    CASE WHEN b IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasBook
ORDER BY dh.downloadedAt DESC;

// ÉTAPE 2: COMPTER LES PROBLÈMES
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

// ÉTAPE 3: SUPPRIMER LES TÉLÉCHARGEMENTS ORPHELINS (sans utilisateur)
// ATTENTION: Utilisez DETACH DELETE pour supprimer les relations aussi
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User)
DETACH DELETE dh;

// ÉTAPE 4: VÉRIFIER APRÈS SUPPRESSION
MATCH (dh:DownloadHistory)
RETURN count(dh) as remainingDownloads;

// ÉTAPE 5: LIER LES TÉLÉCHARGEMENTS SANS LIVRE AU PREMIER LIVRE DISPONIBLE
// (Solution temporaire - dans un vrai système, il faudrait connaître le livre téléchargé)
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WHERE b.available = true
WITH dh, b
ORDER BY b.createdAt
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b)
RETURN dh.id, b.title, 'Relation OF_BOOK créée' as action;

// ÉTAPE 6: VÉRIFIER LES CORRECTIONS
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    count(dh) as totalDownloads,
    count(u) as downloadsWithUser,
    count(b) as downloadsWithBook,
    count(dh) - count(u) as downloadsWithoutUser,
    count(dh) - count(b) as downloadsWithoutBook;

// ÉTAPE 7: CRÉER DES TÉLÉCHARGEMENTS DE TEST COMPLETS
// D'abord, supprimer les anciens tests s'ils existent
MATCH (dh:DownloadHistory)
WHERE dh.userAgent CONTAINS 'Test Browser'
DETACH DELETE dh;

// Créer 3 nouveaux téléchargements de test pour l'admin
MATCH (admin:User {username: 'admin'})
MATCH (book:Book)
WHERE book.available = true
WITH admin, collect(book)[0..3] as books
UNWIND books as book
CREATE (dh:DownloadHistory {
    downloadedAt: datetime(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Browser - Fixed Relations'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, admin.username, book.title, 'Téléchargement de test créé' as action;

// ÉTAPE 8: VÉRIFICATION FINALE - TOUS LES TÉLÉCHARGEMENTS DOIVENT AVOIR LES DEUX RELATIONS
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    u.username,
    b.title,
    b.author
ORDER BY dh.downloadedAt DESC;

// ÉTAPE 9: METTRE À JOUR LES COMPTEURS DE TÉLÉCHARGEMENT
MATCH (b:Book)
OPTIONAL MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b)
WITH b, count(dh) as actualDownloadCount
SET b.downloadCount = actualDownloadCount
RETURN b.title, b.downloadCount as newCount, actualDownloadCount
ORDER BY actualDownloadCount DESC;

// ÉTAPE 10: STATISTIQUES FINALES PAR UTILISATEUR
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    u.username,
    count(dh) as totalDownloads,
    count(b) as downloadsWithBooks,
    count(dh) - count(b) as downloadsWithoutBooks
ORDER BY u.username;