// ========================================
// CORRECTION FINALE DES TÉLÉCHARGEMENTS
// ========================================

// 1. VÉRIFIER L'ID DE L'ADMIN
MATCH (u:User {username: 'admin'})
RETURN u.id as adminId, u.username;

// 2. VOIR TOUS LES TÉLÉCHARGEMENTS EXISTANTS
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    u.username,
    b.title,
    CASE WHEN u IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasUser,
    CASE WHEN b IS NOT NULL THEN 'OUI' ELSE 'NON' END as hasBook;

// 3. SUPPRIMER TOUS LES TÉLÉCHARGEMENTS INCOMPLETS
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User) OR NOT (dh)-[:OF_BOOK]->(:Book)
DETACH DELETE dh;

// 4. CRÉER DES TÉLÉCHARGEMENTS COMPLETS POUR L'ADMIN
MATCH (admin:User {username: 'admin'})
MATCH (books:Book)
WHERE books.available = true AND books.title IS NOT NULL
WITH admin, collect(books)[0..5] as bookList
UNWIND bookList as book
CREATE (dh:DownloadHistory {
    downloadedAt: datetime() - duration({days: toInteger(rand() * 30)}),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, book.title, 'Téléchargement créé' as status;

// 5. VÉRIFIER LA CRÉATION
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as totalDownloadsWithBooks;

// 6. TESTER LA REQUÊTE CORRIGÉE (sans categoryName)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt,
    b.id as bookId,
    b.title as bookTitle,
    b.author as bookAuthor,
    b.coverImage as bookCover,
    c.name as categoryName
ORDER BY dh.downloadedAt DESC
LIMIT 10;

// 7. METTRE À JOUR LES COMPTEURS
MATCH (b:Book)
OPTIONAL MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b)
WITH b, count(dh) as actualCount
SET b.downloadCount = actualCount
RETURN b.title, b.downloadCount
ORDER BY b.downloadCount DESC
LIMIT 5;