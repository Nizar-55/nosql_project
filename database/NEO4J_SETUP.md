# Configuration Neo4j pour Online Library Platform

## 🚀 Installation et Configuration

### Option 1: Avec Docker (Recommandé)

```bash
# 1. Démarrer Neo4j avec Docker Compose
docker-compose up -d neo4j

# 2. Attendre que Neo4j soit prêt (environ 30 secondes)
docker logs library-neo4j

# 3. Accéder à Neo4j Browser
# URL: http://localhost:7474
# Username: neo4j
# Password: neo4j_password_2024
```

### Option 2: Installation locale

1. **Télécharger Neo4j Community Edition**
   - Aller sur https://neo4j.com/download/
   - Télécharger Neo4j Desktop ou Neo4j Community Server

2. **Configuration**
   ```bash
   # Démarrer Neo4j
   neo4j start
   
   # Changer le mot de passe par défaut
   cypher-shell -u neo4j -p neo4j
   CALL dbms.changePassword('neo4j_password_2024');
   ```

## 🔧 Configuration de l'application

### 1. Fichier application-dev.yml

```yaml
spring:
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: neo4j_password_2024
```

### 2. Variables d'environnement

```bash
# Pour le développement local
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USERNAME=neo4j
export NEO4J_PASSWORD=neo4j_password_2024

# Pour Docker
NEO4J_AUTH=neo4j/neo4j_password_2024
```

## 📊 Initialisation des données

### 1. Exécuter le script d'initialisation

```bash
# Option A: Via Neo4j Browser (http://localhost:7474)
# Copier-coller le contenu de neo4j-init.cypher

# Option B: Via cypher-shell
cypher-shell -u neo4j -p neo4j_password_2024 -f database/neo4j-init.cypher
```

### 2. Vérifier l'installation

```cypher
// Compter les nœuds créés
MATCH (n) RETURN labels(n) as Type, count(n) as Count;

// Vérifier les relations
MATCH ()-[r]->() RETURN type(r) as RelationType, count(r) as Count;

// Afficher la structure du graphe
CALL db.schema.visualization();
```

## 🔍 Interface Neo4j Browser

### Accès
- **URL**: http://localhost:7474
- **Username**: neo4j
- **Password**: neo4j_password_2024

### Requêtes utiles pour le développement

```cypher
// 1. Voir tous les livres avec leurs catégories
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
RETURN b.title, b.author, c.name
LIMIT 10;

// 2. Livres les plus populaires
MATCH (b:Book)
RETURN b.title, b.author, b.downloadCount
ORDER BY b.downloadCount DESC
LIMIT 5;

// 3. Recommandations basées sur les catégories
MATCH (b1:Book {title: 'Les Misérables'})-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(b2:Book)
WHERE b1 <> b2
RETURN b2.title, b2.author, c.name;

// 4. Utilisateurs et leurs favoris
MATCH (u:User)-[:FAVORITES]->(b:Book)
RETURN u.username, collect(b.title) as FavoriteBooks;

// 5. Statistiques générales
MATCH (b:Book) 
RETURN 
  count(b) as TotalBooks,
  sum(b.downloadCount) as TotalDownloads,
  avg(b.downloadCount) as AvgDownloads;
```

## 🛠️ Maintenance et Optimisation

### 1. Sauvegarde

```bash
# Sauvegarde complète
neo4j-admin dump --database=neo4j --to=/path/to/backup.dump

# Restauration
neo4j-admin load --from=/path/to/backup.dump --database=neo4j --force
```

### 2. Monitoring des performances

```cypher
// Voir les requêtes lentes
CALL dbms.listQueries() YIELD query, elapsedTimeMillis
WHERE elapsedTimeMillis > 1000
RETURN query, elapsedTimeMillis;

// Statistiques de la base
CALL dbms.queryJmx("org.neo4j:instance=kernel#0,name=Store file sizes");
```

### 3. Index et contraintes

```cypher
// Lister tous les index
CALL db.indexes();

// Lister toutes les contraintes
CALL db.constraints();

// Créer un index personnalisé
CREATE INDEX book_description_fulltext IF NOT EXISTS 
FOR (b:Book) ON (b.description);
```

## 🚨 Dépannage

### Problèmes courants

1. **Connexion refusée**
   ```bash
   # Vérifier que Neo4j est démarré
   docker ps | grep neo4j
   
   # Vérifier les logs
   docker logs library-neo4j
   ```

2. **Authentification échouée**
   ```bash
   # Réinitialiser le mot de passe
   docker exec -it library-neo4j cypher-shell -u neo4j -p neo4j
   CALL dbms.changePassword('neo4j_password_2024');
   ```

3. **Mémoire insuffisante**
   ```yaml
   # Dans docker-compose.yml
   environment:
     NEO4J_dbms_memory_heap_max__size: 4G
     NEO4J_dbms_memory_pagecache_size: 2G
   ```

### Logs utiles

```bash
# Logs Neo4j
docker logs library-neo4j

# Logs de l'application Spring Boot
docker logs library-backend | grep Neo4j
```

## 📈 Avantages de Neo4j pour ce projet

### 1. Recommandations intelligentes
- Relations naturelles entre utilisateurs, livres, catégories
- Algorithmes de traversée de graphe pour recommandations
- Analyse des patterns comportementaux

### 2. Performance des requêtes complexes
- Recherche de livres similaires en une requête
- Recommandations basées sur les favoris des utilisateurs
- Analyse des tendances de lecture

### 3. Flexibilité du modèle
- Ajout facile de nouveaux types de relations
- Évolution du schéma sans migration complexe
- Requêtes expressives avec Cypher

### 4. Visualisation des données
- Interface graphique Neo4j Browser
- Exploration visuelle des relations
- Debugging facilité des algorithmes de recommandation

## 🔗 Ressources utiles

- [Documentation Neo4j](https://neo4j.com/docs/)
- [Guide Cypher](https://neo4j.com/developer/cypher/)
- [Spring Data Neo4j](https://spring.io/projects/spring-data-neo4j)
- [Neo4j Browser Guide](https://neo4j.com/developer/neo4j-browser/)