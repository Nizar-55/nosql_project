// Test script to run after Neo4j is started
// This will verify that the cover fixes are working

const { execSync } = require('child_process');

function testAfterNeo4jStart() {
    console.log('🧪 Test après démarrage de Neo4j...\n');
    
    // Test 1: Vérifier la connectivité backend
    console.log('1. Test de connectivité backend...');
    try {
        const result = execSync('curl -s http://localhost:8083/api/books/test/ping', { encoding: 'utf8' });
        const data = JSON.parse(result);
        console.log('✅ Backend accessible:', data.message);
    } catch (error) {
        console.log('❌ Backend non accessible:', error.message);
        console.log('   → Vérifiez que Neo4j est démarré et que le backend est relancé');
        return;
    }
    
    // Test 2: Diagnostic des couvertures
    console.log('\n2. Diagnostic des couvertures...');
    try {
        const result = execSync('curl -s http://localhost:8083/api/books/test/covers', { encoding: 'utf8' });
        const data = JSON.parse(result);
        
        console.log(`📊 Statistiques:`);
        console.log(`   - Total livres: ${data.totalBooks}`);
        console.log(`   - Livres avec PDF: ${data.booksWithPdf}`);
        console.log(`   - Livres avec couverture: ${data.booksWithCover}`);
        console.log(`   - Livres sans couverture: ${data.booksWithoutCover}`);
        console.log(`   - Dossier covers existe: ${data.coversExists}`);
        
        // Test 3: Vérifier l'accès aux images
        if (data.sampleBooks && data.sampleBooks.length > 0) {
            console.log('\n3. Test d\'accès aux images...');
            
            for (const book of data.sampleBooks) {
                if (book.hasCover && book.coverImage) {
                    console.log(`📖 Livre: ${book.title}`);
                    console.log(`   - Couverture: ${book.coverImage}`);
                    
                    // Extraire le nom du fichier
                    const fileName = book.coverImage.startsWith('covers/') 
                        ? book.coverImage.replace('covers/', '')
                        : book.coverImage;
                    
                    const imageUrl = `http://localhost:8083/api/files/images/${fileName}`;
                    console.log(`   - URL: ${imageUrl}`);
                    
                    try {
                        execSync(`curl -s -I "${imageUrl}" | head -1`, { encoding: 'utf8' });
                        console.log(`   - ✅ Image accessible`);
                    } catch (error) {
                        console.log(`   - ❌ Image non accessible`);
                        console.log(`   - 💡 Vérifiez que le fichier existe dans backend/uploads/covers/`);
                    }
                    break; // Tester seulement le premier
                }
            }
        }
        
        // Test 4: Suggestions
        console.log('\n4. Suggestions...');
        if (data.booksWithoutCover > 0) {
            console.log(`💡 ${data.booksWithoutCover} livres n'ont pas de couverture.`);
            console.log('   Pour les générer automatiquement:');
            console.log('   curl -X POST http://localhost:8083/api/books/regenerate-covers');
            console.log('   (Nécessite une authentification admin)');
        }
        
        if (data.booksWithCover > 0) {
            console.log('✅ Des couvertures sont disponibles!');
            console.log('   Vous pouvez maintenant tester le frontend.');
        }
        
    } catch (error) {
        console.log('❌ Erreur lors du diagnostic:', error.message);
    }
    
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Si des couvertures ont des chemins incorrects, exécutez le script Cypher:');
    console.log('   database/fix-cover-paths.cypher dans Neo4j Browser');
    console.log('2. Démarrez le frontend: cd frontend && npm run dev');
    console.log('3. Testez l\'affichage des couvertures sur http://localhost:3000');
}

testAfterNeo4jStart();