// Script pour tester la génération de couvertures
const API_BASE = 'http://localhost:8081/api';

async function testCovers() {
    try {
        console.log('🖼️  Test de génération des couvertures...\n');
        
        // Test 1: Vérifier les livres existants
        console.log('1. Vérification des livres...');
        const booksResponse = await fetch(`${API_BASE}/books?page=0&size=10`);
        const booksResult = await booksResponse.json();
        
        console.log(`Livres trouvés: ${booksResult.totalElements}`);
        
        // Afficher les couvertures existantes
        booksResult.content.forEach(book => {
            console.log(`- ${book.title}: ${book.coverImage ? '✅ Couverture' : '❌ Pas de couverture'}`);
        });
        
        // Test 2: Régénérer les couvertures (nécessite authentification admin)
        console.log('\n2. Régénération des couvertures...');
        console.log('⚠️  Cette opération nécessite une authentification admin');
        
        // Test 3: Vérifier l'URL des images
        console.log('\n3. Test des URLs d\'images...');
        const bookWithCover = booksResult.content.find(book => book.coverImage);
        
        if (bookWithCover) {
            const fileName = bookWithCover.coverImage.startsWith('covers/') 
                ? bookWithCover.coverImage.replace('covers/', '')
                : bookWithCover.coverImage;
            
            const imageUrl = `${API_BASE}/files/images/${fileName}`;
            console.log(`URL de test: ${imageUrl}`);
            
            try {
                const imageResponse = await fetch(imageUrl);
                if (imageResponse.ok) {
                    console.log('✅ Image accessible');
                } else {
                    console.log(`❌ Image non accessible (${imageResponse.status})`);
                }
            } catch (error) {
                console.log(`❌ Erreur d'accès à l'image: ${error.message}`);
            }
        } else {
            console.log('Aucun livre avec couverture trouvé pour tester');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testCovers();