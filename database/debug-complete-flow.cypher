// ========================================
// DIAGNOSTIC COMPLET DU FLUX DE TÉLÉCHARGEMENTS
// ========================================

// 1. VÉRIFIER L'UTILISATEUR ADMIN
MATCH (u:User {username: 'admin'})
RETURN u.id, u.username, u.email, 'Utilisateur trouvé' as status;

// 2. VÉRIFIER LES TÉLÉCHARGEMENTS DE L'ADMIN
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
RETURN count(dh) as totalDownloadsForAdmin;

// 3. VÉRIFIER LES TÉLÉCHARGEMENTS AVEC LIVRES
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as downloadsWithBooks;

// 4. SIMULER LA REQUÊTE EXACTE DU BACKEND
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE ID(u) = 1  // Remplacez par l'ID réel de l'admin
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.id as downloadId,
    dh.downloadedAt,
    b.id as bookId,
    b.title as bookTitle,
    b.author as bookAuthor,
    b.coverImage as bookCover,
    b.categoryName as categoryName
ORDER BY dh.downloadedAt DESC
LIMIT 10;

// 5. OBTENIR L'ID DE L'ADMIN
MATCH (u:User {username: 'admin'})
RETURN u.id as adminId;

// 6. COMPTER AVEC L'ID EXACT
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
WHERE ID(u) = 1  // Remplacez par l'ID réel
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as exactCount;

// 7. VOIR TOUS LES DÉTAILS D'UN TÉLÉCHARGEMENT
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh {.*},
    b {.*},
    u.username
LIMIT 1;

// 8. VÉRIFIER LES PROPRIÉTÉS DU LIVRE
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: 'admin'})
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    b.id,
    b.title,
    b.author,
    b.coverImage,
    b.available,
    CASE WHEN b.title IS NULL THEN 'TITRE NULL' ELSE 'TITRE OK' END as titleStatus,
    CASE WHEN b.author IS NULL THEN 'AUTEUR NULL' ELSE 'AUTEUR OK' END as authorStatus
LIMIT 5;

// 9. CRÉER UN TÉLÉCHARGEMENT DE TEST COMPLET SI NÉCESSAIRE
MATCH (admin:User {username: 'admin'})
MATCH (book:Book)
WHERE book.available = true AND book.title IS NOT NULL
WITH admin, book
LIMIT 1
CREATE (dh:DownloadHistory {
    downloadedAt: datetime(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Complete Flow'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN 
    dh.id as newDownloadId,
    admin.username,
    book.title,
    'Téléchargement de test créé' as status;