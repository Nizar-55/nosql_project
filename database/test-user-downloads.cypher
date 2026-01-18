// Script pour tester les téléchargements d'un utilisateur spécifique

// 1. Trouver l'ID de l'utilisateur admin
MATCH (u:User {username: "admin"})
RETURN ID(u) as adminId, u.username;

// 2. Tous les téléchargements de l'admin (avec ou sans livre)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "admin"})
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  CASE WHEN b IS NOT NULL THEN b.title ELSE "PAS DE LIVRE" END as bookTitle,
  CASE WHEN b IS NOT NULL THEN "OUI" ELSE "NON" END as hasBook
ORDER BY dh.downloadedAt DESC;

// 3. Téléchargements de l'admin avec la requête actuelle du repository
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "admin"})
MATCH (dh)-[:OF_BOOK]->(b:Book)
OPTIONAL MATCH (b)-[:BELONGS_TO]->(c:Category)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  b.title as bookTitle,
  c.name as categoryName
ORDER BY dh.downloadedAt DESC;

// 4. Compter les téléchargements avec et sans livre pour l'admin
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "admin"})
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  count(dh) as totalDownloads,
  count(b) as downloadsWithBook,
  count(dh) - count(b) as downloadsWithoutBook;

// 5. Vérifier les relations manquantes
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User {username: "admin"})
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  "RELATION OF_BOOK MANQUANTE" as problem
ORDER BY dh.downloadedAt DESC;