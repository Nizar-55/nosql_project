# 🚀 Guide d'Installation Complet - Online Library Platform avec Neo4j

## 📋 ÉTAPE 1: Vérification des prérequis

### 1.1 Vérifier Java 17+
```bash
java -version
# Doit afficher Java 17 ou supérieur
# Si pas installé: télécharger depuis https://adoptium.net/
```

### 1.2 Vérifier Node.js 18+
```bash
node --version
npm --version
# Si pas installé: télécharger depuis https://nodejs.org/
```

### 1.3 Vérifier Maven
```bash
mvn --version
# Si pas installé: télécharger depuis https://maven.apache.org/
```

### 1.4 Vérifier Docker (optionnel mais recommandé)
```bash
docker --version
docker-compose --version
# Si pas installé: télécharger depuis https://docker.com/
```

## 🗂️ ÉTAPE 2: Préparation du projet

### 2.1 Créer la structure des dossiers
```bash
# Créer le dossier uploads pour les fichiers
mkdir -p uploads/books
mkdir -p uploads/covers

# Créer le dossier logs
mkdir -p logs
```

### 2.2 Copier le fichier de configuration d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos paramètres
# Voir section ÉTAPE 3 pour les valeurs
```

## 🗄️ ÉTAPE 3: Configuration Neo4j

### Option A: Avec Docker (RECOMMANDÉ)

#### 3.1 Démarrer Neo4j avec Docker
```bash
# Démarrer uniquement Neo4j
docker-compose up -d neo4j

# Vérifier que Neo4j est démarré
docker ps | grep neo4j
docker logs library-neo4j
```

#### 3.2 Attendre que Neo4j soit prêt
```bash
# Attendre environ 30-60 secondes
# Vérifier les logs jusqu'à voir "Started."
docker logs -f library-neo4j
```

#### 3.3 Accéder à Neo4j Browser
```
URL: http://localhost:7474
Username: neo4j
Password: neo4j_password_2024
```

### Option B: Installation locale de Neo4j

#### 3.1 Télécharger Neo4j Community Edition
```bash
# Aller sur https://neo4j.com/download/
# Télécharger Neo4j Desktop ou Community Server
```

#### 3.2 Installer et configurer
```bash
# Démarrer Neo4j
neo4j start

# Changer le mot de passe (première connexion)
# Aller sur http://localhost:7474
# Username: neo4j, Password: neo4j
# Changer vers: neo4j_password_2024
```

## 📊 ÉTAPE 4: Initialisation de la base de données

### 4.1 Ouvrir Neo4j Browser
```
URL: http://localhost:7474
Login: neo4j / neo4j_password_2024
```

### 4.2 Exécuter le script d'initialisation
```bash
# Option A: Copier-coller dans Neo4j Browser
# Ouvrir le fichier database/neo4j-init.cypher
# Copier tout le contenu
# Coller dans Neo4j Browser et exécuter

# Option B: Via ligne de commande (si Neo4j local)
cypher-shell -u neo4j -p neo4j_password_2024 -f database/neo4j-init.cypher
```

### 4.3 Vérifier l'initialisation
```cypher
// Dans Neo4j Browser, exécuter ces requêtes:

// 1. Compter les nœuds
MATCH (n) RETURN labels(n) as Type, count(n) as Count;

// 2. Vérifier les relations
MATCH ()-[r]->() RETURN type(r) as RelationType, count(r) as Count;

// 3. Voir quelques livres
MATCH (b:Book)-[:BELONGS_TO]->(c:Category)
RETURN b.title, b.author, c.name LIMIT 5;
```

## ⚙️ ÉTAPE 5: Configuration du Backend

### 5.1 Aller dans le dossier backend
```bash
cd backend
```

### 5.2 Vérifier la configuration Neo4j
```bash
# Éditer src/main/resources/application-dev.yml
# Vérifier que les paramètres Neo4j sont corrects:
```

```yaml
spring:
  neo4j:
    uri: bolt://localhost:7687
    authentication:
      username: neo4j
      password: neo4j_password_2024
```

### 5.3 Compiler le projet
```bash
# Nettoyer et compiler
mvn clean compile

# Si erreurs, vérifier les dépendances
mvn dependency:resolve
```

### 5.4 Démarrer le backend
```bash
# Option A: Avec Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Option B: Avec Java (après compilation)
mvn package -DskipTests
java -jar target/online-library-backend-1.0.0.jar --spring.profiles.active=dev
```

### 5.5 Vérifier que le backend fonctionne
```bash
# Tester l'API
curl http://localhost:8080/api/books

# Accéder à la documentation Swagger
# URL: http://localhost:8080/swagger-ui.html
```

## 🎨 ÉTAPE 6: Configuration du Frontend

### 6.1 Aller dans le dossier frontend
```bash
cd ../frontend
```

### 6.2 Installer les dépendances
```bash
npm install
```

### 6.3 Vérifier la configuration API
```bash
# Créer/éditer le fichier .env.local
echo "VITE_API_URL=http://localhost:8080/api" > .env.local
```

### 6.4 Démarrer le frontend
```bash
# Mode développement
npm run dev

# Le frontend sera accessible sur http://localhost:5173
```

## 🧪 ÉTAPE 7: Tests et vérification

### 7.1 Tester la connexion complète
```bash
# 1. Vérifier Neo4j: http://localhost:7474
# 2. Vérifier Backend: http://localhost:8080/swagger-ui.html
# 3. Vérifier Frontend: http://localhost:5173
```

### 7.2 Créer un compte utilisateur
```bash
# Aller sur http://localhost:5173
# Cliquer sur "S'inscrire"
# Créer un compte de test
```

### 7.3 Tester les fonctionnalités
```bash
# 1. Connexion avec admin/admin123
# 2. Navigation dans les livres
# 3. Ajout aux favoris
# 4. Test des recommandations
```

## 🐳 ÉTAPE 8: Démarrage avec Docker (Alternative complète)

### 8.1 Démarrer tous les services
```bash
# Retourner à la racine du projet
cd ..

# Démarrer tous les services
docker-compose up -d

# Vérifier que tous les conteneurs sont démarrés
docker-compose ps
```

### 8.2 Attendre l'initialisation
```bash
# Attendre que tous les services soient prêts (2-3 minutes)
docker-compose logs -f

# Vérifier les logs individuels
docker logs library-neo4j
docker logs library-backend
docker logs library-frontend
```

### 8.3 Initialiser Neo4j (même avec Docker)
```bash
# Accéder à Neo4j Browser: http://localhost:7474
# Login: neo4j / neo4j_password_2024
# Exécuter le script database/neo4j-init.cypher
```

## 🔧 ÉTAPE 9: Dépannage des problèmes courants

### 9.1 Neo4j ne démarre pas
```bash
# Vérifier les ports
netstat -an | grep 7474
netstat -an | grep 7687

# Vérifier les logs Docker
docker logs library-neo4j

# Redémarrer Neo4j
docker-compose restart neo4j
```

### 9.2 Backend ne se connecte pas à Neo4j
```bash
# Vérifier la configuration
cat backend/src/main/resources/application-dev.yml

# Tester la connexion Neo4j
docker exec -it library-neo4j cypher-shell -u neo4j -p neo4j_password_2024

# Vérifier les logs du backend
docker logs library-backend | grep -i neo4j
```

### 9.3 Frontend ne se connecte pas au backend
```bash
# Vérifier la configuration
cat frontend/.env.local

# Tester l'API backend
curl http://localhost:8080/api/books

# Vérifier les logs du frontend
docker logs library-frontend
```

### 9.4 Erreurs de compilation
```bash
# Backend - nettoyer et recompiler
cd backend
mvn clean install -DskipTests

# Frontend - nettoyer et réinstaller
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📱 ÉTAPE 10: Accès aux interfaces

### 10.1 URLs importantes
```
Frontend (Application):     http://localhost:5173
Backend API:               http://localhost:8080/api
Documentation Swagger:     http://localhost:8080/swagger-ui.html
Neo4j Browser:            http://localhost:7474
```

### 10.2 Comptes par défaut
```
Administrateur:
- Username: admin
- Password: admin123

Neo4j:
- Username: neo4j  
- Password: neo4j_password_2024
```

## ✅ ÉTAPE 11: Validation finale

### 11.1 Checklist de vérification
- [ ] Neo4j accessible sur http://localhost:7474
- [ ] Script d'initialisation exécuté avec succès
- [ ] Backend démarré sans erreurs
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Connexion admin fonctionne
- [ ] Livres visibles dans l'interface
- [ ] Recommandations générées

### 11.2 Tests fonctionnels
```bash
# 1. Se connecter en tant qu'admin
# 2. Ajouter un livre aux favoris
# 3. Vérifier les recommandations
# 4. Télécharger un livre (si PDF disponible)
# 5. Consulter les statistiques admin
```

## 🎯 Félicitations !

Votre plateforme de bibliothèque en ligne avec Neo4j est maintenant opérationnelle ! 🚀

Pour toute question ou problème, consultez les logs ou référez-vous à la documentation dans le dossier `database/`.