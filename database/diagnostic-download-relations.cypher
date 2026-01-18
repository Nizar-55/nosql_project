// Script de diagnostic pour vérifier les relations de téléchargement

// 1. Compter tous les téléchargements
MATCH (dh:DownloadHistory)
RETURN count(dh) as totalDownloadHistory;

// 2. Compter les téléchargements avec relation vers un utilisateur
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
RETURN count(dh) as downloadsWithUser;

// 3. Compter les téléchargements avec relation vers un livre
MATCH (dh:DownloadHistory)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as downloadsWithBook;

// 4. Compter les téléchargements avec les deux relations
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN count(dh) as downloadsWithBothRelations;

// 5. Téléchargements sans livre (problématiques)
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:OF_BOOK]->(:Book)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  u.username as username,
  "MANQUE RELATION LIVRE" as status
ORDER BY dh.downloadedAt DESC;

// 6. Téléchargements sans utilisateur (problématiques)
MATCH (dh:DownloadHistory)
WHERE NOT (dh)-[:DOWNLOADED_BY]->(:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  b.title as bookTitle,
  "MANQUE RELATION USER" as status
ORDER BY dh.downloadedAt DESC;

// 7. Téléchargements complets (avec les deux relations)
MATCH (dh:DownloadHistory)-[:DOWNLOADED_BY]->(u:User)
MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  ID(dh) as downloadId,
  dh.downloadedAt as downloadDate,
  u.username as username,
  b.title as bookTitle,
  "COMPLET" as status
ORDER BY dh.downloadedAt DESC
LIMIT 10;

// 8. Résumé des statistiques
MATCH (dh:DownloadHistory)
OPTIONAL MATCH (dh)-[:DOWNLOADED_BY]->(u:User)
OPTIONAL MATCH (dh)-[:OF_BOOK]->(b:Book)
RETURN 
  count(dh) as totalDownloads,
  count(u) as withUser,
  count(b) as withBook,
  count(CASE WHEN u IS NOT NULL AND b IS NOT NULL THEN 1 END) as complete,
  count(CASE WHEN u IS NULL THEN 1 END) as missingUser,
  count(CASE WHEN b IS NULL THEN 1 END) as missingBook;