// Script de test pour vérifier les filtres
const API_BASE = 'http://localhost:8081/api';

async function testFilters() {
    try {
        console.log('🔍 Test des filtres...\n');
        
        // Test 1: Récupérer toutes les catégories
        console.log('1. Récupération des catégories...');
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        const categories = await categoriesResponse.json();
        console.log('Catégories trouvées:', categories.map(c => `${c.id}: ${c.name}`));
        
        const sciFiCategory = categories.find(c => c.name === 'Science-Fiction');
        if (!sciFiCategory) {
            console.error('❌ Catégorie Science-Fiction non trouvée !');
            return;
        }
        console.log(`✅ Science-Fiction trouvée avec ID: ${sciFiCategory.id}\n`);
        
        // Test 2: Test de l'endpoint de diagnostic
        console.log('2. Test de l\'endpoint de diagnostic...');
        const testResponse = await fetch(`${API_BASE}/books/test/filters?categoryId=${sciFiCategory.id}`);
        const testResult = await testResponse.json();
        console.log('Résultat du test:', JSON.stringify(testResult, null, 2));
        console.log('');
        
        // Test 3: Test de l'endpoint normal avec filtres
        console.log('3. Test de l\'endpoint normal avec filtres...');
        const booksResponse = await fetch(`${API_BASE}/books?categoryId=${sciFiCategory.id}&page=0&size=10`);
        const booksResult = await booksResponse.json();
        console.log(`Livres retournés: ${booksResult.totalElements}`);
        console.log('Premiers livres:', booksResult.content.slice(0, 3).map(b => `${b.title} (Catégorie: ${b.categoryName || 'N/A'})`));
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

testFilters();