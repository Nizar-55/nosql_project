// ========================================
// CRÉER DES TÉLÉCHARGEMENTS DE TEST GARANTIS
// ========================================

// 1. NETTOYER COMPLÈTEMENT
MATCH (dh:DownloadHistory)
DETACH DELETE dh;

// 2. VÉRIFIER QUE TOUT EST SUPPRIMÉ
MATCH (dh:DownloadHistory)
RETURN count(dh) as remaining;

// 3. VÉRIFIER QUE L'ADMIN ET LES LIVRES EXISTENT
MATCH (admin:User {username: 'admin'})
MATCH (books:Book)
WHERE books.available = true
RETURN admin.id as adminId, count(books) as availableBooks;

// 4. CRÉER 5 TÉLÉCHARGEMENTS DE TEST AVEC TOUTES LES RELATIONS
MATCH (admin:User {username: 'admin'})
MATCH (books:Book)
WHERE books.available = true AND books.title IS NOT NULL
WITH admin, collect(books)[0..4] as bookList
UNWIND range(0, size(bookList)-1) as i
WITH admin, bookList[i] as book, i
CREATE (dh:DownloadHistory {
    downloadedAt: datetime() - duration({days: i + 1}),
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser ' + toString(i + 1) + ')'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt,
    admin.username,
    book.id as bookId,
    book.title as bookTitle,
    'Téléchargement créé' as status;

// 5. VÉRIFIER LA CRÉATION
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as totalCreated;

// 6. TESTER LA REQUÊTE EXACTE DU BACKEND
MATCH (admin:User {username: 'admin'})
WITH admin.id as adminId
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE ID(u) = adminId
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
ORDER BY dh.downloadedAt DESC;

// 7. COMPTER AVEC LA REQUÊTE DE COMPTAGE
MATCH (admin:User {username: 'admin'})
WITH admin.id as adminId
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE ID(u) = adminId
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as countResult;