# 🚀 Guide de démarrage Neo4j pour corriger les couvertures

## Problème actuel
Le backend ne peut pas se connecter à Neo4j (erreur 500). Les couvertures ont été corrigées mais le backend a besoin de Neo4j pour fonctionner.

## ✅ Solution rapide

### Option 1: Neo4j Desktop (Recommandé)
1. **Ouvrir Neo4j Desktop** (déjà installé sur votre système)
2. **Créer/Démarrer une base de données:**
   - Cliquer sur "New" → "Create project"
   - Ou utiliser un projet existant
   - Cliquer sur "Add" → "Local DBMS"
   - Nom: `library-db`
   - Mot de passe: `Islam2004`
   - Version: Neo4j 5.x
   - Cliquer sur "Create"
3. **Démarrer la base:**
   - Cliquer sur le bouton "Start" à côté de votre base
   - Attendre que le statut devienne "Active"
4. **Vérifier la connexion:**
   - Port 7687 doit être ouvert
   - Username: `neo4j`
   - Password: `Islam2004`

### Option 2: Docker (Alternative)
```bash
# Si Docker est disponible
docker run -d \
  --name neo4j-library \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/Islam2004 \
  neo4j:5.15-community
```

## 🔧 Corrections des couvertures déjà effectuées

✅ **FileController corrigé** - Cherche maintenant dans `covers/` au lieu de `books/covers/`
✅ **Fichiers de couverture déplacés** - De `uploads/books/pdf/` vers `uploads/covers/`
✅ **Backend recompilé** - Prêt avec les nouvelles corrections

## 📋 Étapes suivantes une fois Neo4j démarré

1. **Redémarrer le backend:**
   ```bash
   # Le backend va se reconnecter automatiquement
   ```

2. **Mettre à jour les chemins en base:**
   ```cypher
   // Exécuter dans Neo4j Browser (http://localhost:7474)
   MATCH (b:Book) 
   WHERE b.coverImage STARTS WITH "books/pdf/" 
     AND b.coverImage ENDS WITH "_cover.jpg"
   SET b.coverImage = "covers/" + substring(b.coverImage, 10)
   RETURN b.id, b.title, b.coverImage;
   ```

3. **Tester les couvertures:**
   ```bash
   # Test de connectivité
   curl http://localhost:8083/api/books/test/ping
   
   # Test des couvertures
   curl http://localhost:8083/api/books/test/covers
   ```

4. **Régénérer les couvertures manquantes:**
   ```bash
   # Via l'API (nécessite authentification admin)
   curl -X POST http://localhost:8083/api/books/regenerate-covers
   ```

## 🎯 Résultat attendu

Une fois Neo4j démarré:
- ✅ Backend fonctionnel (plus d'erreur 500)
- ✅ Images de couverture accessibles via `/api/files/images/{filename}`
- ✅ Couvertures affichées dans le frontend
- ✅ Génération automatique pour nouveaux livres

## 🔍 Vérification

Après démarrage de Neo4j, vérifier:
1. **Neo4j Browser:** http://localhost:7474 (neo4j/Islam2004)
2. **Backend API:** http://localhost:8083/api/books/test/ping
3. **Test couvertures:** http://localhost:8083/api/books/test/covers
4. **Frontend:** http://localhost:3000 (si démarré)

## 📞 Support

Si problème persiste:
1. Vérifier les logs du backend
2. Tester la connexion Neo4j
3. Vérifier que les fichiers sont dans `backend/uploads/covers/`