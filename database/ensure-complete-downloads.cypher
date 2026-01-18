// ========================================
// S'ASSURER QUE TOUS LES TÉLÉCHARGEMENTS SONT COMPLETS
// ========================================

// 1. DIAGNOSTIC INITIAL
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WITH 
    count(dh) as total,
    count(u) as withUser,
    count(b) as withBook
RETURN 
    total,
    withUser,
    withBook,
    total - withUser as missingUser,
    total - withBook as missingBook;

// 2. SUPPRIMER LES TÉLÉCHARGEMENTS INCOMPLETS
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User) OR NOT (dh)-[:OF_BOOK]->(:Book)
DETACH DELETE dh;

// 3. VÉRIFIER APRÈS NETTOYAGE
MATCH (dh:DownloadHistory)
RETURN count(dh) as remainingDownloads;

// 4. CRÉER DES TÉLÉCHARGEMENTS COMPLETS POUR L'ADMIN
MATCH (admin:User {username: 'admin'})
MATCH (books:Book)
WHERE books.available = true
WITH admin, collect(books)[0..5] as bookList
UNWIND bookList as book
CREATE (dh:DownloadHistory {
    downloadedAt: datetime() - duration({days: rand() * 30}),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, admin.username, book.title, 'Téléchargement créé' as status;

// 5. VÉRIFICATION FINALE - TOUS DOIVENT AVOIR LES DEUX RELATIONS
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    u.username,
    count(dh) as totalDownloads,
    collect(DISTINCT b.title)[0..3] as sampleBooks
ORDER BY totalDownloads DESC;

// 6. TEST DE LA REQUÊTE BACKEND EXACTE
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE u.username = 'admin'
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id,
    dh.downloadedAt,
    b.id as bookId,
    b.title as bookTitle,
    b.author as bookAuthor
ORDER BY dh.downloadedAt DESC
LIMIT 10;