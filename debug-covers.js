// Script de diagnostic pour les couvertures
const API_BASE = 'http://localhost:8081/api';

async function debugCovers() {
    try {
        console.log('🔍 Diagnostic des couvertures...\n');
        
        // Test 1: Vérifier les livres et leurs couvertures
        console.log('1. Vérification des livres...');
        const booksResponse = await fetch(`${API_BASE}/books?page=0&size=20`);
        const booksResult = await booksResponse.json();
        
        console.log(`Total livres: ${booksResult.totalElements}\n`);
        
        let withPdf = 0;
        let withCover = 0;
        let withoutCover = 0;
        
        booksResult.content.forEach((book, index) => {
            const hasPdf = book.pdfFile && book.pdfFile.trim() !== '';
            const hasCover = book.coverImage && book.coverImage.trim() !== '';
            
            if (hasPdf) withPdf++;
            if (hasCover) withCover++;
            else withoutCover++;
            
            console.log(`${index + 1}. ${book.title}`);
            console.log(`   PDF: ${hasPdf ? '✅ ' + book.pdfFile : '❌ Aucun'}`);
            console.log(`   Couverture: ${hasCover ? '✅ ' + book.coverImage : '❌ Aucune'}`);
            console.log('');
        });
        
        console.log(`Résumé:`);
        console.log(`- Livres avec PDF: ${withPdf}`);
        console.log(`- Livres avec couverture: ${withCover}`);
        console.log(`- Livres sans couverture: ${withoutCover}\n`);
        
        // Test 2: Vérifier l'endpoint de régénération
        console.log('2. Test de l\'endpoint de régénération...');
        console.log('⚠️  Tentative de régénération (nécessite auth admin)...');
        
        try {
            const regenResponse = await fetch(`${API_BASE}/books/regenerate-covers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pas d'auth pour le test, on verra l'erreur
                }
            });
            
            if (regenResponse.status === 401) {
                console.log('❌ Authentification requise (normal)');
            } else if (regenResponse.status === 403) {
                console.log('❌ Droits admin requis (normal)');
            } else {
                const regenResult = await regenResponse.json();
                console.log('✅ Régénération:', regenResult);
            }
        } catch (error) {
            console.log('❌ Erreur endpoint:', error.message);
        }
        
        // Test 3: Vérifier l'accès aux fichiers
        console.log('\n3. Test d\'accès aux fichiers...');
        
        const bookWithCover = booksResult.content.find(book => book.coverImage);
        if (bookWithCover) {
            const fileName = bookWithCover.coverImage.startsWith('covers/') 
                ? bookWithCover.coverImage.replace('covers/', '')
                : bookWithCover.coverImage;
            
            const imageUrl = `${API_BASE}/files/images/${fileName}`;
            console.log(`Test URL: ${imageUrl}`);
            
            try {
                const imageResponse = await fetch(imageUrl);
                console.log(`Status: ${imageResponse.status} ${imageResponse.statusText}`);
                
                if (imageResponse.ok) {
                    console.log('✅ Image accessible');
                } else {
                    console.log('❌ Image non accessible');
                }
            } catch (error) {
                console.log('❌ Erreur accès image:', error.message);
            }
        } else {
            console.log('Aucune couverture à tester');
        }
        
        // Test 4: Vérifier la structure des dossiers
        console.log('\n4. Recommandations:');
        if (withPdf > 0 && withCover === 0) {
            console.log('🔧 Actions à effectuer:');
            console.log('   1. Vérifier que le dossier uploads/covers existe');
            console.log('   2. Vérifier les permissions d\'écriture');
            console.log('   3. Exécuter la régénération en tant qu\'admin');
            console.log('   4. Vérifier les logs du backend pour les erreurs');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

debugCovers();