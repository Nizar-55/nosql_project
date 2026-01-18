// Test simple du backend avec les nouveaux filtres
const API_BASE = 'http://localhost:8081/api';

async function testBackend() {
    try {
        console.log('🔍 Test du backend avec filtres simplifiés...\n');
        
        // Test 1: Ping
        console.log('1. Test de connectivité...');
        const pingResponse = await fetch(`${API_BASE}/books/test/ping`);
        const pingResult = await pingResponse.json();
        console.log('✅ Backend accessible:', pingResult.message);
        
        // Test 2: Récupérer les catégories
        console.log('\n2. Récupération des catégories...');
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        const categories = await categoriesResponse.json();
        console.log('Catégories trouvées:', categories.length);
        
        const sciFiCategory = categories.find(c => c.name === 'Science-Fiction');
        if (!sciFiCategory) {
            console.error('❌ Catégorie Science-Fiction non trouvée !');
            return;
        }
        console.log(`✅ Science-Fiction trouvée avec ID: ${sciFiCategory.id}`);
        
        // Test 3: Test de l'endpoint de diagnostic simplifié
        console.log('\n3. Test de l\'endpoint de diagnostic...');
        const testResponse = await fetch(`${API_BASE}/books/test/filters?categoryId=${sciFiCategory.id}`);
        const testResult = await testResponse.json();
        console.log('Résultat du test:', JSON.stringify(testResult, null, 2));
        
        // Test 4: Test de l'endpoint normal avec filtre catégorie
        console.log('\n4. Test de l\'endpoint normal avec filtre catégorie...');
        const booksResponse = await fetch(`${API_BASE}/books?categoryId=${sciFiCategory.id}&page=0&size=10`);
        const booksResult = await booksResponse.json();
        console.log(`✅ Livres retournés: ${booksResult.totalElements}`);
        console.log('Premiers livres:', booksResult.content.slice(0, 3).map(b => `- ${b.title} par ${b.author}`));
        
        if (booksResult.totalElements === 3) {
            console.log('\n🎉 SUCCÈS ! Le filtre fonctionne correctement !');
        } else {
            console.log(`\n⚠️  Attention: ${booksResult.totalElements} livres trouvés au lieu de 3`);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testBackend();