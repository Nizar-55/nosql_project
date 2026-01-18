// Script de test des couvertures avec la bonne URL
const API_BASE = 'http://localhost:8083/api';

async function testCoversCorrect() {
    try {
        console.log('🔍 Test des couvertures (URL correcte)...\n');
        
        // Test 1: Ping
        console.log('1. Test de connectivité...');
        try {
            const pingResponse = await fetch(`${API_BASE}/books/test/ping`);
            const pingResult = await pingResponse.json();
            console.log('✅ Backend accessible:', pingResult.message);
        } catch (error) {
            console.log('❌ Erreur ping:', error.message);
            return;
        }
        
        // Test 2: Diagnostic des couvertures
        console.log('\n2. Diagnostic des couvertures...');
        try {
            const testResponse = await fetch(`${API_BASE}/books/test/covers`);
            const testResult = await testResponse.json();
            
            console.log('Résultats du diagnostic:');
            console.log(`- Total livres: ${testResult.totalBooks}`);
            console.log(`- Avec PDF: ${testResult.booksWithPdf}`);
            console.log(`- Avec couverture: ${testResult.booksWithCover}`);
            console.log(`- Sans couverture: ${testResult.booksWithoutCover}`);
            console.log(`- Dossier uploads: ${testResult.uploadsExists ? '✅' : '❌'} ${testResult.uploadsPath}`);
            console.log(`- Dossier covers: ${testResult.coversExists ? '✅' : '❌'} ${testResult.coversPath}`);
            console.log(`- PDFBox disponible: ${testResult.pdfBoxAvailable ? '✅' : '❌'}`);
            
            if (testResult.sampleBooks) {
                console.log('\nÉchantillon de livres:');
                testResult.sampleBooks.forEach(book => {
                    console.log(`- ${book.title}:`);
                    console.log(`  PDF: ${book.hasPdf ? '✅ ' + book.pdfFile : '❌ Aucun'}`);
                    console.log(`  Couverture: ${book.hasCover ? '✅ ' + book.coverImage : '❌ Aucune'}`);
                });
            }
            
            // Recommandations
            console.log('\n🔧 Recommandations:');
            if (testResult.booksWithPdf > 0 && testResult.booksWithCover === 0) {
                console.log('- Il y a des livres avec PDF mais sans couverture');
                console.log('- Exécutez la régénération des couvertures');
            } else if (testResult.booksWithPdf === 0) {
                console.log('- Aucun livre n\'a de fichier PDF');
                console.log('- Ajoutez des PDFs aux livres pour générer des couvertures');
            } else if (testResult.booksWithCover > 0) {
                console.log('- Certains livres ont déjà des couvertures');
                console.log('- Vérifiez l\'affichage dans le frontend');
            }
            
        } catch (error) {
            console.log('❌ Erreur diagnostic:', error.message);
        }
        
        // Test 3: Vérifier l'accès aux images
        console.log('\n3. Test d\'accès aux images...');
        try {
            const booksResponse = await fetch(`${API_BASE}/books?page=0&size=5`);
            const booksResult = await booksResponse.json();
            
            const bookWithCover = booksResult.content.find(book => book.coverImage);
            if (bookWithCover) {
                const fileName = bookWithCover.coverImage.startsWith('covers/') 
                    ? bookWithCover.coverImage.replace('covers/', '')
                    : bookWithCover.coverImage;
                
                const imageUrl = `${API_BASE}/files/images/${fileName}`;
                console.log(`Test URL image: ${imageUrl}`);
                
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    console.log('✅ Image accessible');
                } else {
                    console.log(`❌ Image non accessible (${imageResponse.status})`);
                }
            } else {
                console.log('Aucune couverture à tester');
            }
        } catch (error) {
            console.log('❌ Erreur test images:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

testCoversCorrect();