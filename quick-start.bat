@echo off
echo 🚀 Démarrage de Online Library Platform avec Neo4j
echo ==================================================
echo.

REM ÉTAPE 1: Vérification des prérequis
echo [ÉTAPE 1] Vérification des prérequis...

REM Vérifier Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java non trouvé. Installez Java 17+ depuis https://adoptium.net/
    pause
    exit /b 1
) else (
    echo ✅ Java trouvé
)

REM Vérifier Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js non trouvé. Installez Node.js 18+ depuis https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js trouvé
)

REM Vérifier Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Docker non trouvé. Installation manuelle de Neo4j sera nécessaire.
) else (
    echo ✅ Docker trouvé
)

REM ÉTAPE 2: Préparation des dossiers
echo.
echo [ÉTAPE 2] Création des dossiers nécessaires...
if not exist "uploads\books" mkdir uploads\books
if not exist "uploads\covers" mkdir uploads\covers
if not exist "logs" mkdir logs
echo ✅ Dossiers créés

REM ÉTAPE 3: Démarrage de Neo4j
echo.
echo [ÉTAPE 3] Démarrage de Neo4j...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Démarrage de Neo4j avec Docker...
    docker-compose up -d neo4j
    
    echo Attente du démarrage de Neo4j (30 secondes)...
    timeout /t 30 /nobreak >nul
    
    docker ps | findstr library-neo4j >nul
    if %errorlevel% equ 0 (
        echo ✅ Neo4j démarré avec succès
        echo Neo4j Browser: http://localhost:7474
        echo Login: neo4j / Password: neo4j_password_2024
    ) else (
        echo ❌ Échec du démarrage de Neo4j
        docker logs library-neo4j
        pause
        exit /b 1
    )
) else (
    echo ⚠️ Docker non disponible. Veuillez installer Neo4j manuellement:
    echo 1. Téléchargez Neo4j depuis https://neo4j.com/download/
    echo 2. Installez et démarrez Neo4j
    echo 3. Changez le mot de passe vers: neo4j_password_2024
    echo 4. Relancez ce script
    pause
    exit /b 1
)

REM ÉTAPE 4: Instructions pour l'initialisation
echo.
echo [ÉTAPE 4] Initialisation de la base de données
echo.
echo 🔧 ACTIONS MANUELLES REQUISES:
echo 1. Ouvrez Neo4j Browser: http://localhost:7474
echo 2. Connectez-vous avec: neo4j / neo4j_password_2024
echo 3. Copiez et exécutez le contenu du fichier: database\neo4j-init.cypher
echo.
echo Appuyez sur une touche quand l'initialisation Neo4j est terminée...
pause >nul

REM ÉTAPE 5: Compilation du backend
echo.
echo [ÉTAPE 5] Compilation du backend...
cd backend

echo Nettoyage et compilation Maven...
mvn clean compile -q
if %errorlevel% neq 0 (
    echo ❌ Échec de la compilation du backend
    pause
    exit /b 1
) else (
    echo ✅ Backend compilé avec succès
)

REM ÉTAPE 6: Installation des dépendances frontend
echo.
echo [ÉTAPE 6] Installation des dépendances frontend...
cd ..\frontend

echo Installation des packages npm...
npm install --silent
if %errorlevel% neq 0 (
    echo ❌ Échec de l'installation des dépendances frontend
    pause
    exit /b 1
) else (
    echo ✅ Dépendances frontend installées
)

REM Créer le fichier de configuration frontend
echo VITE_API_URL=http://localhost:8080/api > .env.local
echo ✅ Configuration frontend créée

cd ..

REM ÉTAPE 7: Instructions finales
echo.
echo [ÉTAPE 7] Démarrage des services
echo.
echo 🚀 COMMANDES POUR DÉMARRER L'APPLICATION:
echo.
echo Terminal 1 - Backend:
echo cd backend
echo mvn spring-boot:run -Dspring-boot.run.profiles=dev
echo.
echo Terminal 2 - Frontend:
echo cd frontend
echo npm run dev
echo.
echo 📱 ACCÈS AUX INTERFACES:
echo - Application: http://localhost:5173
echo - API Backend: http://localhost:8080/api
echo - Documentation: http://localhost:8080/swagger-ui.html
echo - Neo4j Browser: http://localhost:7474
echo.
echo 👤 COMPTE ADMINISTRATEUR:
echo - Username: admin
echo - Password: admin123
echo.
echo ✅ Configuration terminée avec succès!
echo.
echo 🎯 Suivez les instructions ci-dessus pour démarrer l'application.
pause