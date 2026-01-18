// Script pour configurer et tester les couvertures
const fs = require('fs');
const path = require('path');

function setupCovers() {
    console.log('🔧 Configuration des couvertures...\n');
    
    // Créer les dossiers nécessaires
    const uploadsDir = path.join(__dirname, 'backend', 'uploads');
    const coversDir = path.join(uploadsDir, 'covers');
    const booksDir = path.join(uploadsDir, 'books');
    const booksPdfDir = path.join(booksDir, 'pdf');
    const booksCoversDir = path.join(booksDir, 'covers');
    
    const directories = [
        uploadsDir,
        coversDir,
        booksDir,
        booksPdfDir,
        booksCoversDir
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Dossier créé: ${dir}`);
            } catch (error) {
                console.log(`❌ Erreur création dossier ${dir}:`, error.message);
            }
        } else {
            console.log(`✅ Dossier existe: ${dir}`);
        }
    });
    
    console.log('\n📋 Instructions pour tester les couvertures:');
    console.log('1. Démarrez le backend');
    console.log('2. Testez le diagnostic: node force-generate-covers.js');
    console.log('3. Connectez-vous en tant qu\'admin dans l\'interface');
    console.log('4. Exécutez dans la console du navigateur:');
    console.log('');
    console.log('   fetch("/api/books/regenerate-covers", {');
    console.log('     method: "POST",');
    console.log('     headers: {');
    console.log('       "Authorization": "Bearer " + localStorage.getItem("accessToken")');
    console.log('     }');
    console.log('   }).then(r => r.json()).then(console.log);');
    console.log('');
    console.log('5. Rechargez la page des livres');
    
    console.log('\n🔍 Vérifications à faire:');
    console.log('- Les livres ont-ils des fichiers PDF ?');
    console.log('- Le backend a-t-il les permissions d\'écriture ?');
    console.log('- Y a-t-il des erreurs dans les logs du backend ?');
}

setupCovers();