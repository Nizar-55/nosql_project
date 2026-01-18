// Fix cover image paths in Neo4j database
// Change paths from "books/pdf/filename_cover.jpg" to "covers/filename_cover.jpg"

// First, let's see what cover paths we have
MATCH (b:Book) 
WHERE b.coverImage IS NOT NULL AND b.coverImage <> ""
RETURN b.id, b.title, b.coverImage
ORDER BY b.id;

// Update paths that start with "books/pdf/" and end with "_cover.jpg"
MATCH (b:Book) 
WHERE b.coverImage IS NOT NULL 
  AND b.coverImage STARTS WITH "books/pdf/" 
  AND b.coverImage ENDS WITH "_cover.jpg"
SET b.coverImage = "covers/" + substring(b.coverImage, 10)  // Remove "books/pdf/" (10 chars) and add "covers/"
RETURN b.id, b.title, b.coverImage AS newCoverPath;

// Verify the changes
MATCH (b:Book) 
WHERE b.coverImage IS NOT NULL AND b.coverImage <> ""
RETURN b.id, b.title, b.coverImage
ORDER BY b.id;