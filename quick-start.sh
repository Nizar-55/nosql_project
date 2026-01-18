#!/bin/bash

echo "🚀 Démarrage de Online Library Platform avec Neo4j"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_step() {
    echo -e "${BLUE}[ÉTAPE $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ÉTAPE 1: Vérification des prérequis
print_step "1" "Vérification des prérequis..."

# Vérifier Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    print_success "Java trouvé: $JAVA_VERSION"
else
    print_error "Java non trouvé. Installez Java 17+ depuis https://adoptium.net/"
    exit 1
fi

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js trouvé: $NODE_VERSION"
else
    print_error "Node.js non trouvé. Installez Node.js 18+ depuis https://nodejs.org/"
    exit 1
fi

# Vérifier Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker trouvé: $DOCKER_VERSION"
else
    print_warning "Docker non trouvé. Installation manuelle de Neo4j sera nécessaire."
fi

# ÉTAPE 2: Préparation des dossiers
print_step "2" "Création des dossiers nécessaires..."
mkdir -p uploads/books uploads/covers logs
print_success "Dossiers créés"

# ÉTAPE 3: Démarrage de Neo4j
print_step "3" "Démarrage de Neo4j..."

if command -v docker &> /dev/null; then
    echo "Démarrage de Neo4j avec Docker..."
    docker-compose up -d neo4j
    
    echo "Attente du démarrage de Neo4j (30 secondes)..."
    sleep 30
    
    # Vérifier si Neo4j est démarré
    if docker ps | grep -q library-neo4j; then
        print_success "Neo4j démarré avec succès"
        echo "Neo4j Browser: http://localhost:7474"
        echo "Login: neo4j / Password: neo4j_password_2024"
    else
        print_error "Échec du démarrage de Neo4j"
        docker logs library-neo4j
        exit 1
    fi
else
    print_warning "Docker non disponible. Veuillez installer Neo4j manuellement:"
    echo "1. Téléchargez Neo4j depuis https://neo4j.com/download/"
    echo "2. Installez et démarrez Neo4j"
    echo "3. Changez le mot de passe vers: neo4j_password_2024"
    echo "4. Relancez ce script"
    exit 1
fi

# ÉTAPE 4: Instructions pour l'initialisation
print_step "4" "Initialisation de la base de données"
echo ""
echo "🔧 ACTIONS MANUELLES REQUISES:"
echo "1. Ouvrez Neo4j Browser: http://localhost:7474"
echo "2. Connectez-vous avec: neo4j / neo4j_password_2024"
echo "3. Copiez et exécutez le contenu du fichier: database/neo4j-init.cypher"
echo ""
echo "Appuyez sur ENTRÉE quand l'initialisation Neo4j est terminée..."
read -r

# ÉTAPE 5: Compilation du backend
print_step "5" "Compilation du backend..."
cd backend

echo "Nettoyage et compilation Maven..."
if mvn clean compile -q; then
    print_success "Backend compilé avec succès"
else
    print_error "Échec de la compilation du backend"
    exit 1
fi

# ÉTAPE 6: Installation des dépendances frontend
print_step "6" "Installation des dépendances frontend..."
cd ../frontend

echo "Installation des packages npm..."
if npm install --silent; then
    print_success "Dépendances frontend installées"
else
    print_error "Échec de l'installation des dépendances frontend"
    exit 1
fi

# Créer le fichier de configuration frontend
echo "VITE_API_URL=http://localhost:8080/api" > .env.local
print_success "Configuration frontend créée"

cd ..

# ÉTAPE 7: Instructions finales
print_step "7" "Démarrage des services"
echo ""
echo "🚀 COMMANDES POUR DÉMARRER L'APPLICATION:"
echo ""
echo "Terminal 1 - Backend:"
echo "cd backend"
echo "mvn spring-boot:run -Dspring-boot.run.profiles=dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "cd frontend" 
echo "npm run dev"
echo ""
echo "📱 ACCÈS AUX INTERFACES:"
echo "- Application: http://localhost:5173"
echo "- API Backend: http://localhost:8080/api"
echo "- Documentation: http://localhost:8080/swagger-ui.html"
echo "- Neo4j Browser: http://localhost:7474"
echo ""
echo "👤 COMPTE ADMINISTRATEUR:"
echo "- Username: admin"
echo "- Password: admin123"
echo ""
print_success "Configuration terminée avec succès!"
echo ""
echo "🎯 Suivez les instructions ci-dessus pour démarrer l'application."