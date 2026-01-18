# Guide de Configuration - Online Library Platform

## 📋 Prérequis

- **Java 17+** (OpenJDK ou Oracle JDK)
- **Node.js 18+** et npm
- **PostgreSQL 13+**
- **Maven 3.8+**
- **Git**

## 🗄️ Configuration de la Base de Données

### Option 1: Installation PostgreSQL locale

1. **Installer PostgreSQL**
   ```bash
   # Windows (avec Chocolatey)
   choco install postgresql
   
   # macOS (avec Homebrew)
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   ```

2. **Créer la base de données**
   ```bash
   # Se connecter à PostgreSQL
   psql -U postgres
   
   # Exécuter le script de configuration
   \i database/setup.sql
   ```

3. **Vérifier la connexion**
   ```bash
   psql -U library_user -d online_library -h localhost -p 5432
   ```

### Option 2: Utiliser Docker (Recommandé)

1. **Démarrer PostgreSQL avec Docker**
   ```bash
   docker-compose up postgres -d
   ```

2. **Vérifier que la base est créée**
   ```bash
   docker exec -it library-postgres psql -U library_user -d online_library
   ```

## ⚙️ Configuration du Backend

### 1. Configurer les variables d'environnement

Créez un fichier `.env` à partir de `.env.example`:
```bash
cp .env.example .env
```

Modifiez les valeurs selon votre environnement:
```properties
# Votre configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=online_library
DB_USERNAME=votre_utilisateur_postgres
DB_PASSWORD=votre_mot_de_passe_postgres

# Générez une clé JWT sécurisée (minimum 32 caractères)
JWT_SECRET=VotreCleSuperSecreteQuiDoitEtreTresLongueEtComplexe123456789
```

### 2. Configurer application-dev.yml

Modifiez `backend/src/main/resources/application-dev.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/online_library
    username: votre_utilisateur  # Remplacez par votre utilisateur
    password: votre_mot_de_passe # Remplacez par votre mot de passe
```

### 3. Profils Spring disponibles

- **dev**: Développement local
- **docker**: Conteneurs Docker
- **prod**: Production

Activez un profil:
```bash
# Via variable d'environnement
export SPRING_PROFILES_ACTIVE=dev

# Via argument JVM
java -Dspring.profiles.active=dev -jar app.jar

# Via Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## 🎨 Configuration du Frontend

### 1. Variables d'environnement

Créez `frontend/.env.local`:
```properties
VITE_API_URL=http://localhost:8080/api
```

### 2. Pour la production

Créez `frontend/.env.production`:
```properties
VITE_API_URL=https://votre-domaine.com/api
```

## 🚀 Démarrage de l'Application

### Méthode 1: Développement local

1. **Démarrer la base de données**
   ```bash
   # Avec Docker
   docker-compose up postgres redis -d
   
   # Ou votre PostgreSQL local
   sudo service postgresql start
   ```

2. **Démarrer le backend**
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Démarrer le frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Méthode 2: Docker Compose (Recommandé)

```bash
# Construire et démarrer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

## 🔧 Configuration Avancée

### Sécurité JWT

Générez une clé JWT sécurisée:
```bash
# Générer une clé aléatoire de 64 caractères
openssl rand -base64 64
```

### Upload de fichiers

Configurez le répertoire d'upload:
```yaml
app:
  upload:
    dir: /chemin/vers/votre/repertoire/uploads
    max-size: 52428800  # 50MB
```

### Base de données en production

Pour la production, utilisez des variables d'environnement:
```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/online_library}
    username: ${DATABASE_USERNAME:library_user}
    password: ${DATABASE_PASSWORD:library_password}
```

## 🔍 Vérification de l'Installation

### 1. Backend
- API: http://localhost:8080/api
- Documentation: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

### 2. Frontend
- Application: http://localhost:5173 (dev) ou http://localhost:3000 (Docker)

### 3. Base de données
```sql
-- Vérifier les tables créées
\dt

-- Vérifier les données initiales
SELECT * FROM roles;
SELECT * FROM categories;
SELECT * FROM users;
```

## 🐛 Résolution des Problèmes

### Erreur de connexion à la base de données
```
Caused by: org.postgresql.util.PSQLException: Connection refused
```
**Solution**: Vérifiez que PostgreSQL est démarré et accessible sur le port 5432.

### Erreur JWT
```
JWT signature does not match locally computed signature
```
**Solution**: Vérifiez que la clé JWT est la même entre les redémarrages.

### Erreur de port occupé
```
Port 8080 is already in use
```
**Solution**: 
```bash
# Trouver le processus utilisant le port
lsof -i :8080

# Tuer le processus
kill -9 <PID>
```

### Problème de permissions de fichiers
```bash
# Donner les permissions au répertoire uploads
chmod 755 uploads/
chown -R $USER:$USER uploads/
```

## 📊 Monitoring et Logs

### Logs de l'application
```bash
# Backend
tail -f backend/logs/application.log

# Docker
docker-compose logs -f backend
```

### Métriques (Actuator)
- http://localhost:8080/actuator/metrics
- http://localhost:8080/actuator/health
- http://localhost:8080/actuator/info

## 🔐 Comptes par Défaut

Après l'installation, utilisez ces comptes pour tester:

**Administrateur:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@library.com`

**Note**: Changez ces mots de passe en production !

## 📝 Configuration Personnalisée

### Ajouter de nouvelles catégories
```sql
INSERT INTO categories (name, description, icon, color) VALUES 
('Votre Catégorie', 'Description', 'icon-name', '#couleur');
```

### Configurer CORS pour votre domaine
```yaml
app:
  cors:
    allowed-origins: https://votre-domaine.com,https://www.votre-domaine.com
```

### Configurer l'email (pour les notifications futures)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: votre-email@gmail.com
    password: votre-mot-de-passe-app
```