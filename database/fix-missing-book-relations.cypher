// Script pour créer les relations manquantes entre DownloadHistory et Book
// Ce script va associer chaque téléchargement à un livre aléatoire existant

// 1. D'abord, vérifier les téléchargements sans livre
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
RETURN count(dh) as downloadsWithoutBook;

// 2. Vérifier combien de livres sont disponibles
MATCH (b:Book)
RETURN count(b) as totalBooks;

// 3. Créer les relations manquantes en associant chaque téléchargement à un livre aléatoire
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// 4. Vérifier que toutes les relations ont été créées
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  count(dh) as totalDownloads,
  count(b) as downloadsWithBook,
  count(dh) - count(b) as downloadsWithoutBook;

// 5. Afficher quelques exemples de téléchargements avec leurs livres
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN dh.downloadedAt, u.username, b.title
ORDER BY dh.downloadedAt DESC
LIMIT 10;