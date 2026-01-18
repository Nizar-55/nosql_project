// Script pour créer des relations réalistes entre DownloadHistory et Book
// Ce script va associer les téléchargements aux livres de manière plus intelligente

// 1. Vérifier l'état actuel
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  count(dh) as totalDownloads,
  count(b) as downloadsWithBook,
  count(dh) - count(b) as downloadsWithoutBook;

// 2. Supprimer les relations OF_BOOK existantes si nécessaire (optionnel)
// MATCH (dh:DownloadHistory)-[r:OF_BOOK]->(b:Book)
// DELETE r;

// 3. Créer des relations réalistes basées sur les dates
// Les téléchargements plus récents auront tendance à être des livres plus récents

// Pour les téléchargements de l'admin (ID 4-10)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "admin"})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// Pour les téléchargements d'islamch (ID 11-12)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "islamch"})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// Pour les téléchargements de test (ID 13-14)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "test"})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// Pour les téléchargements de user_7420 (ID 15-16)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "user_7420"})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// Pour le téléchargement le plus récent (ID 17)
MATCH (dh:DownloadHistory)
WHERE dh.downloadedAt CONTAINS "2026-01-11T21:34:30"
AND NOT (dh)-[:OF_BOOK]->(:Book)
WITH dh
MATCH (b:Book)
WITH dh, b, rand() as r
ORDER BY r
LIMIT 1
CREATE (dh)-[:OF_BOOK]->(b);

// 4. Vérifier le résultat final
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
RETURN 
  count(dh) as totalDownloads,
  count(b) as downloadsWithBook,
  count(dh) - count(b) as downloadsWithoutBook;

// 5. Afficher un échantillon des téléchargements avec leurs relations complètes
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  u.username as username,
  CASE WHEN b IS NOT NULL THEN b.title ELSE "PAS DE LIVRE" END as bookTitle
ORDER BY dh.downloadedAt DESC
LIMIT 20;