// Script rapide pour corriger les relations manquantes DownloadHistory -> Book

// 1. Diagnostic initial
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WITH count(dh) as total, count(b) as withBook
RETURN total, withBook, (total - withBook) as missing;

// 2. Créer les relations manquantes
// Associer chaque téléchargement sans livre à un livre aléatoire
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, collect(b) as books
WITH dh, books[toInteger(rand() * size(books))] as randomBook
CREATE (dh)-[:OF_BOOK]->(randomBook);

// 3. Vérification finale
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
WITH count(dh) as total, count(b) as withBook
RETURN total, withBook, (total - withBook) as stillMissing;

// 4. Afficher quelques exemples
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN u.username, b.title, dh.downloadedAt
ORDER BY dh.downloadedAt DESC
LIMIT 5;