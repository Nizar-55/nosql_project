const axios = require('axios');

const API_BASE = 'http://localhost:8083/api';

async function testCoversFix() {
    console.log('🔧 Test de la correction des couvertures...\n');
    
    try {
        // Test 1: Vérifier la connectivité
        console.log('1. Test de connectivité...');
        const pingResponse = await axios.get(`${API_BASE}/books/test/ping`);
        console.log('✅ Backend accessible:', pingResponse.data.message);
        
        // Test 2: Diagnostic des couvertures
        console.log('\n2. Diagnostic des couvertures...');
        const coversResponse = await axios.get(`${API_BASE}/books/test/covers`);
        const coversData = coversResponse.data;
        
        console.log(`📊 Statistiques:`);
        console.log(`   - Total livres: ${coversData.totalBooks}`);
        console.log(`   - Livres avec PDF: ${coversData.booksWithPdf}`);
        console.log(`   - Livres avec couverture: ${coversData.booksWithCover}`);
        console.log(`   - Livres sans couverture: ${coversData.booksWithoutCover}`);
        console.log(`   - Dossier uploads: ${coversData.uploadsPath}`);
        console.log(`   - Dossier covers: ${coversData.coversPath}`);
        console.log(`   - Dossier covers existe: ${coversData.coversExists}`);
        
        // Test 3: Tester l'accès à une image (si il y en a)
        if (coversData.sampleBooks && coversData.sampleBooks.length > 0) {
            console.log('\n3. Test d\'accès aux images...');
            
            for (const book of coversData.sampleBooks) {
                if (book.hasCover && book.coverImage) {
                    console.log(`📖 Livre: ${book.title}`);
                    console.log(`   - Couverture: ${book.coverImage}`);
                    
                    // Extraire le nom du fichier
                    const fileName = book.coverImage.startsWith('covers/') 
                        ? book.coverImage.replace('covers/', '')
                        : book.coverImage;
                    
                    const imageUrl = `${API_BASE}/files/images/${fileName}`;
                    console.log(`   - URL: ${imageUrl}`);
                    
                    try {
                        const imageResponse = await axios.head(imageUrl);
                        console.log(`   - ✅ Image accessible (${imageResponse.status})`);
                    } catch (error) {
                        console.log(`   - ❌ Image non accessible (${error.response?.status || error.message})`);
                    }
                    break; // Tester seulement le premier
                }
            }
        }
        
        // Test 4: Suggérer la régénération si nécessaire
        if (coversData.booksWithoutCover > 0) {
            console.log(`\n💡 Suggestion: ${coversData.booksWithoutCover} livres n'ont pas de couverture.`);
            console.log('   Vous pouvez utiliser l\'endpoint POST /api/books/regenerate-covers pour les générer.');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.response?.data || error.message);
    }
}

testCoversFix();