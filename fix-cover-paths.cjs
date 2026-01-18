const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = './backend/uploads';
const WRONG_COVERS_DIR = path.join(UPLOADS_DIR, 'books', 'pdf');
const CORRECT_COVERS_DIR = path.join(UPLOADS_DIR, 'covers');

function fixCoverPaths() {
    console.log('🔧 Correction des chemins des couvertures...\n');
    
    try {
        // Créer le dossier covers s'il n'existe pas
        if (!fs.existsSync(CORRECT_COVERS_DIR)) {
            fs.mkdirSync(CORRECT_COVERS_DIR, { recursive: true });
            console.log('✅ Dossier covers créé');
        }
        
        // Lister les fichiers dans le mauvais dossier
        const files = fs.readdirSync(WRONG_COVERS_DIR);
        const coverFiles = files.filter(file => file.endsWith('_cover.jpg'));
        
        console.log(`📁 Fichiers de couverture trouvés dans ${WRONG_COVERS_DIR}:`);
        coverFiles.forEach(file => console.log(`   - ${file}`));
        
        if (coverFiles.length === 0) {
            console.log('ℹ️  Aucun fichier de couverture à déplacer');
            return;
        }
        
        // Déplacer les fichiers
        let movedCount = 0;
        for (const file of coverFiles) {
            const sourcePath = path.join(WRONG_COVERS_DIR, file);
            const destPath = path.join(CORRECT_COVERS_DIR, file);
            
            try {
                // Vérifier si le fichier de destination existe déjà
                if (fs.existsSync(destPath)) {
                    console.log(`⚠️  ${file} existe déjà dans le dossier de destination, ignoré`);
                    continue;
                }
                
                // Déplacer le fichier
                fs.renameSync(sourcePath, destPath);
                console.log(`✅ Déplacé: ${file}`);
                movedCount++;
                
            } catch (error) {
                console.error(`❌ Erreur lors du déplacement de ${file}:`, error.message);
            }
        }
        
        console.log(`\n📊 Résumé:`);
        console.log(`   - Fichiers trouvés: ${coverFiles.length}`);
        console.log(`   - Fichiers déplacés: ${movedCount}`);
        
        if (movedCount > 0) {
            console.log('\n💡 Note: Vous devrez peut-être mettre à jour les chemins dans la base de données.');
            console.log('   Les anciens chemins comme "books/pdf/filename_cover.jpg"');
            console.log('   doivent être changés en "covers/filename_cover.jpg"');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

fixCoverPaths();