// Script pour forcer la génération de couvertures
const API_BASE = 'http://localhost:8081/api';

// Vous devez remplacer ce token par un vrai token admin
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

async function forceGenerateCovers() {
    try {
        console.log('🔧 Génération forcée des couvertures...\n');
        
        // Test 1: Diagnostic
        console.log('1. Diagnostic...');
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
                console.log(`- ${book.title}: PDF=${book.hasPdf ? '✅' : '❌'}, Cover=${book.hasCover ? '✅' : '❌'}`);
            });
        }
        
        // Test 2: Tentative de régénération
        console.log('\n2. Tentative de régénération...');
        
        if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
            console.log('⚠️  Pour régénérer les couvertures, vous devez:');
            console.log('   1. Vous connecter en tant qu\'admin dans l\'interface');
            console.log('   2. Ouvrir les outils de développement (F12)');
            console.log('   3. Aller dans l\'onglet Console');
            console.log('   4. Exécuter cette commande:');
            console.log('');
            console.log('   fetch("/api/books/regenerate-covers", {');
            console.log('     method: "POST",');
            console.log('     headers: {');
            console.log('       "Authorization": "Bearer " + localStorage.getItem("accessToken")');
            console.log('     }');
            console.log('   }).then(r => r.json()).then(console.log);');
            console.log('');
        } else {
            try {
                const regenResponse = await fetch(`${API_BASE}/books/regenerate-covers`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ADMIN_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (regenResponse.ok) {
                    const regenResult = await regenResponse.json();
                    console.log('✅ Régénération réussie:', regenResult);
                } else {
                    console.log(`❌ Erreur ${regenResponse.status}: ${regenResponse.statusText}`);
                }
            } catch (error) {
                console.log('❌ Erreur:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

forceGenerateCovers();