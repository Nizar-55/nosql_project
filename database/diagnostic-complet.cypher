// ========================================
// DIAGNOSTIC COMPLET - ÉTAPE PAR ÉTAPE
// ========================================

// 1. VÉRIFIER QUE L'ADMIN EXISTE
MATCH (u:User {username: 'admin'})
RETURN u.id, u.username, u.email, 'Admin trouvé' as status;

// 2. VÉRIFIER QU'IL Y A DES LIVRES
MATCH (b:Book)
WHERE b.available = true
RETURN count(b) as totalBooks, collect(b.title)[0..3] as sampleTitles;

// 3. VÉRIFIER LES TÉLÉCHARGEMENTS EXISTANTS
MATCH (dh:DownloadHistory)
RETURN count(dh) as totalDownloadHistory;

// 4. VÉRIFIER LES RELATIONS DES TÉLÉCHARGEMENTS
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    count(dh) as total,
    count(u) as withUser,
    count(b) as withBook,
    count(dh) - count(u) as missingUser,
    count(dh) - count(b) as missingBook;

// 5. VOIR LES DÉTAILS DES TÉLÉCHARGEMENTS
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    u.username,
    b.title,
    CASE WHEN u IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasUser,
    CASE WHEN b IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasBook
ORDER BY dh.downloadedAt DESC
LIMIT 10;