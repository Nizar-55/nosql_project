// ========================================
// DIAGNOSTIC DÉTAILLÉ DES TÉLÉCHARGEMENTS
// ========================================

// 1. VOIR TOUS LES TÉLÉCHARGEMENTS AVEC LEURS RELATIONS
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt as downloadDate,
    dh.userAgent as userAgent,
    u.username as username,
    u.id as userId,
    b.title as bookTitle,
    b.id as bookId,
    CASE WHEN u IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasUser,
    CASE WHEN b IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasBook
ORDER BY dh.downloadedAt DESC;

// 2. COMPTER PAR UTILISATEUR
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    u.username,
    u.id as userId,
    count(dh) as totalDownloads,
    count(b) as downloadsWithBooks,
    count(dh) - count(b) as downloadsWithoutBooks
ORDER BY u.username;

// 3. SIMULER LA REQUÊTE DU BACKEND POUR L'ADMIN
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE u.username = 'admin'
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    dh.userAgent,
    b.id as bookId,
    b.title as bookTitle,
    b.author as bookAuthor,
    b.coverImage as bookCover
ORDER BY dh.downloadedAt DESC;

// 4. VÉRIFIER LES RELATIONS SPÉCIFIQUEMENT
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    b.title,
    b.author,
    'RELATION COMPLÈTE' as status
ORDER BY dh.downloadedAt DESC;

// 5. VOIR LES TÉLÉCHARGEMENTS SANS LIVRE
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    'PAS DE LIVRE' as status;

// 6. STATISTIQUES GLOBALES
MATCH (dh:DownloadHistory)
RETURN 
    count(dh) as totalDownloadHistory,
    count{(dh)-[:DOWNLOADED_BY]->(:User)} as withUserRelation,
    count{(dh)-[:OF_BOOK]->(:Book)} as withBookRelation;