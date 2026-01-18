// ========================================
// NETTOYAGE COMPLET ET RECRÉATION DES TÉLÉCHARGEMENTS
// ========================================

// 1. SUPPRIMER TOUS LES TÉLÉCHARGEMENTS EXISTANTS
MATCH (dh:DownloadHistory)
DETACH DELETE dh;

// 2. VÉRIFIER QUE TOUT EST SUPPRIMÉ
MATCH (dh:DownloadHistory)
RETURN count(dh) as remainingDownloads;

// 3. CRÉER DES TÉLÉCHARGEMENTS DE TEST COMPLETS POUR L'ADMIN
MATCH (admin:User {username: 'admin'})
MATCH (books:Book)
WHERE books.available = true
WITH admin, collect(books)[0..5] as bookList
UNWIND bookList as book
CREATE (dh:DownloadHistory {
    downloadedAt: datetime() - duration({days: rand() * 30}), // Dates aléatoires sur 30 jours
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)'
})
CREATE (dh)-[:DOWNLOADED_BY]->(admin)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, admin.username, book.title, 'Téléchargement créé' as status;

// 4. CRÉER DES TÉLÉCHARGEMENTS POUR D'AUTRES UTILISATEURS S'ILS EXISTENT
MATCH (user:User)
WHERE user.username <> 'admin'
MATCH (books:Book)
WHERE books.available = true
WITH user, collect(books)[0..2] as bookList
UNWIND bookList as book
CREATE (dh:DownloadHistory {
    downloadedAt: datetime() - duration({days: rand() * 15}), // Dates aléatoires sur 15 jours
    ipAddress: '192.168.1.' + toString(toInteger(rand() * 255)),
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})
CREATE (dh)-[:DOWNLOADED_BY]->(user)
CREATE (dh)-[:OF_BOOK]->(book)
RETURN dh.id, user.username, book.title, 'Téléchargement créé' as status;

// 5. METTRE À JOUR LES COMPTEURS DE TÉLÉCHARGEMENT DES LIVRES
MATCH (b:Book)
OPTIONAL MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b)
WITH b, count(dh) as actualDownloadCount
SET b.downloadCount = actualDownloadCount
RETURN b.title, b.downloadCount
ORDER BY b.downloadCount DESC;

// 6. VÉRIFICATION FINALE
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    u.username,
    count(dh) as totalDownloads,
    collect(DISTINCT b.title)[0..3] as sampleBooks
ORDER BY totalDownloads DESC;

// 7. AFFICHER QUELQUES EXEMPLES
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
    dh.downloadedAt,
    u.username,
    b.title,
    b.author
ORDER BY dh.downloadedAt DESC
LIMIT 10;