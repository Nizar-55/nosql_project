// Script Node.js pour tester la création de téléchargements avec toutes les relations
const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

// Configuration
const testUser = {
    username: 'admin',
    password: 'admin123'
};

async function testDownloadCreation() {
    try {
        console.log('🚀 Test de création de téléchargements...');
        
        // 1. Se connecter
        console.log('📝 Connexion...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
        const token = loginResponse.data.token;
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('✅ Connecté avec succès');
        
        // 2. Récupérer les livres disponibles
        console.log('📚 Récupération des livres...');
        const booksResponse = await axios.get(`${API_BASE}/books?size=5`, { headers });
        const books = booksResponse.data.content;
        
        console.log(`📖 ${books.length} livres trouvés`);
        
        if (books.length === 0) {
            console.log('❌ Aucun livre disponible pour les tests');
            return;
        }
        
        // 3. Tester le debug des téléchargements AVANT
        console.log('🔍 Debug téléchargements AVANT...');
        try {
            const debugBefore = await axios.get(`${API_BASE}/users/downloads-debug`, { headers });
            console.log('Debug AVANT:', JSON.stringify(debugBefore.data, null, 2));
        } catch (error) {
            console.log('Erreur debug AVANT:', error.response?.data || error.message);
        }
        
        // 4. Simuler des téléchargements
        console.log('⬇️ Simulation de téléchargements...');
        
        for (let i = 0; i < Math.min(3, books.length); i++) {
            const book = books[i];
            console.log(`📥 Téléchargement du livre: ${book.title}`);
            
            try {
                // Simuler le téléchargement (cela devrait créer un DownloadHistory)
                const downloadResponse = await axios.get(
                    `${API_BASE}/users/download/${book.id}`, 
                    { 
                        headers,
                        responseType: 'blob' // Pour recevoir le fichier
                    }
                );
                
                console.log(`✅ Téléchargement simulé pour: ${book.title}`);
                
            } catch (error) {
                console.log(`❌ Erreur téléchargement ${book.title}:`, error.response?.status, error.response?.statusText);
            }
            
            // Attendre un peu entre les téléchargements
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 5. Tester le debug des téléchargements APRÈS
        console.log('🔍 Debug téléchargements APRÈS...');
        try {
            const debugAfter = await axios.get(`${API_BASE}/users/downloads-debug`, { headers });
            console.log('Debug APRÈS:', JSON.stringify(debugAfter.data, null, 2));
        } catch (error) {
            console.log('Erreur debug APRÈS:', error.response?.data || error.message);
        }
        
        // 6. Tester l'endpoint principal des téléchargements
        console.log('📋 Test endpoint principal des téléchargements...');
        try {
            const downloadsResponse = await axios.get(`${API_BASE}/users/downloads?page=0&size=10`, { headers });
            console.log('Téléchargements récupérés:', JSON.stringify(downloadsResponse.data, null, 2));
        } catch (error) {
            console.log('Erreur endpoint principal:', error.response?.data || error.message);
        }
        
        console.log('✅ Test terminé');
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.response?.data || error.message);
    }
}

// Fonction pour tester la connectivité
async function testConnectivity() {
    try {
        console.log('🔗 Test de connectivité...');
        const response = await axios.get(`${API_BASE}/books/test/ping`);
        console.log('✅ API accessible:', response.data);
        return true;
    } catch (error) {
        console.log('❌ API non accessible:', error.message);
        return false;
    }
}

// Exécuter les tests
async function runTests() {
    console.log('🧪 Démarrage des tests de téléchargements...\n');
    
    // Test de connectivité d'abord
    const isConnected = await testConnectivity();
    if (!isConnected) {
        console.log('❌ Impossible de se connecter à l\'API. Vérifiez que le backend est démarré.');
        return;
    }
    
    console.log(''); // Ligne vide
    
    // Test principal
    await testDownloadCreation();
}

// Lancer les tests
runTests().catch(console.error);