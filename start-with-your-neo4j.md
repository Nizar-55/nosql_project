# 🚀 Démarrage avec votre instance Neo4j "biblioSpringboot"

## 📋 Configuration actuelle
- **Instance Neo4j**: biblioSpringboot
- **Username**: neo4j
- **Password**: Islam2004
- **URL**: neo4j://127.0.0.1:7687

## 🎯 ÉTAPES DE DÉMARRAGE

### 1. Vérifier que votre instance Neo4j est démarrée
```bash
# Vérifier si Neo4j est en cours d'exécution
# Ouvrir Neo4j Desktop ou vérifier le service
```

### 2. Tester la connexion à votre instance
```bash
# Ouvrir Neo4j Browser
# URL: http://localhost:7474
# Login: neo4j
# Password: Islam2004
```

### 3. Initialiser la base de données
Dans Neo4j Browser, exécuter le script d'initialisation :

```cypher
// Copier et coller le contenu du fichier database/neo4j-init.cypher
// Ou exécuter section par section :

// 1. Créer les contraintes
CREATE CONSTRAINT unique_category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE;
CREATE CONSTRAINT unique_tag_name IF NOT EXISTS FOR (t:Tag) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT unique_user_username IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE;
CREATE CONSTRAINT unique_user_email IF NOT EXISTS FOR (u:User) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT unique_book_isbn IF NOT EXISTS FOR (b:Book) REQUIRE b.isbn IS UNIQUE;
CREATE CONSTRAINT unique_role_name IF NOT EXISTS FOR (r:Role) REQUIRE r.name IS UNIQUE;

// 2. Créer les rôles
MERGE (adminRole:Role {name: 'ADMIN'})
SET adminRole.description = 'Administrateur avec tous les privilèges',
    adminRole.createdAt = datetime(),
    adminRole.updatedAt = datetime();

MERGE (userRole:Role {name: 'USER'})
SET userRole.description = 'Utilisateur standard avec accès limité',
    userRole.createdAt = datetime(),
    userRole.updatedAt = datetime();

// 3. Créer l'utilisateur admin
MATCH (adminRole:Role {name: 'ADMIN'})
MERGE (admin:User {username: 'admin'})
SET admin.email = 'admin@library.com',
    admin.password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    admin.firstName = 'Admin',
    admin.lastName = 'System',
    admin.enabled = true,
    admin.downloadCount = 0,
    admin.createdAt = datetime(),
    admin.updatedAt = datetime()
MERGE (admin)-[:HAS_ROLE]->(adminRole);
```

### 4. Vérifier l'initialisation
```cypher
// Compter les nœuds créés
MATCH (n) RETURN labels(n) as Type, count(n) as Count;

// Vérifier l'utilisateur admin
MATCH (u:User {username: 'admin'})-[:HAS_ROLE]->(r:Role)
RETURN u.username, u.email, r.name;
```

### 5. Préparer les dossiers
```bash
mkdir -p uploads/books uploads/covers logs
```

### 6. Démarrer le backend
```bash
cd backend
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 7. Démarrer le frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8080/api" > .env.local
npm run dev
```

## 🔗 Accès aux interfaces

- **Application**: http://localhost:5173
- **Neo4j Browser**: http://localhost:7474 (neo4j/Islam2004)
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 👤 Compte administrateur

- **Username**: admin
- **Password**: admin123

## 🧪 Test de connexion

Pour vérifier que tout fonctionne :

1. Ouvrir http://localhost:5173
2. Se connecter avec admin/admin123
3. Vérifier que les données s'affichent

## 🚨 Dépannage

### Si erreur de connexion Neo4j :
```bash
# Vérifier que Neo4j est démarré
# Dans Neo4j Desktop, vérifier l'état de l'instance "biblioSpringboot"

# Tester la connexion manuellement
cypher-shell -a neo4j://127.0.0.1:7687 -u neo4j -p Islam2004
```

### Si erreur de compilation :
```bash
cd backend
mvn clean install -DskipTests
```

### Si erreur frontend :
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## ✅ Validation

Une fois tout démarré, vous devriez pouvoir :
- Accéder à Neo4j Browser avec neo4j/Islam2004
- Voir les données dans le graphe Neo4j
- Se connecter à l'application avec admin/admin123
- Naviguer dans l'interface utilisateur