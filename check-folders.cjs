// Script pour vérifier la structure des dossiers
const fs = require('fs');
const path = require('path');

function checkFolders() {
    console.log('📁 Vérification de la structure des dossiers...\n');
    
    const backendRoot = path.join(__dirname, 'backend');
    const uploadsDir = path.join(backendRoot, 'uploads');
    
    console.log('Dossier backend:', backendRoot);
    console.log('Dossier uploads configuré:', uploadsDir);
    console.log('');
    
    // Vérifier la structure actuelle
    const foldersToCheck = [
        'uploads',
        'uploads/books',
        'uploads/books/pdf',
        'uploads/books/covers',
        'uploads/covers'  // Ancien format
    ];
    
    foldersToCheck.forEach(folder => {
        const fullPath = path.join(backendRoot, folder);
        const exists = fs.existsSync(fullPath);
        
        console.log(`${exists ? '✅' : '❌'} ${folder}`);
        
        if (exists) {
            try {
                const files = fs.readdirSync(fullPath);
                if (files.length > 0) {
                    console.log(`   📄 ${files.length} fichier(s):`);
                    files.slice(0, 5).forEach(file => {
                        const filePath = path.join(fullPath, file);
                        const stats = fs.statSync(filePath);
                        const size = (stats.size / 1024).toFixed(1);
                        console.log(`      - ${file} (${size} KB)`);
                    });
                    if (files.length > 5) {
                        console.log(`      ... et ${files.length - 5} autres`);
                    }
                }
            } catch (error) {
                console.log(`   ❌ Erreur lecture: ${error.message}`);
            }
        }
        console.log('');
    });
    
    console.log('📋 Configuration recommandée:');
    console.log('1. PDFs uploadés → uploads/books/pdf/');
    console.log('2. Couvertures générées → uploads/books/covers/');
    console.log('3. URLs d\'accès:');
    console.log('   - PDFs: /api/files/download/books/pdf/{filename}');
    console.log('   - Images: /api/files/images/{filename}');
}

checkFolders();