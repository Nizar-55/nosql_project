// Test simple des téléchargements avec diagnostic détaillé
const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testDownloads() {
    try {
        console.log('🧪 Test complet des téléchargements...\n');
        
        // 1. Test de connectivité
        console.log('🔗 Test de connectivité...');
        try {
            const pingResponse = await axios.get(`${API_BASE}/books/test/ping`);
            console.log('✅ API accessible:', pingResponse.data.message);
        } catch (error) {
            console.log('❌ API non accessible:', error.message);
            return;
        }
        
        // 2. Se connecter
        console.log('\n📝 Connexion...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('✅ Connecté avec succès');
        
        // 3. Test debug détaillé
        console.log('\n🔍 Test debug détaillé...');
        try {
            const debugResponse = await axios.get(`${API_BASE}/users/downloads-debug`, { headers });
            console.log('📊 Résultat debug:');
            console.log(`- User ID: ${debugResponse.data.userId}`);
            console.log(`- Username: ${debugResponse.data.username}`);
            console.log(`- Total downloads: ${debugResponse.data.totalDownloads}`);
            console.log(`- Downloads found: ${debugResponse.data.downloadsFound}`);
            
            if (debugResponse.data.downloads && debugResponse.data.downloads.length > 0) {
                console.log('\n📚 Détails des téléchargements:');
                debugResponse.data.downloads.forEach((download, index) => {
                    console.log(`  ${index + 1}. ID: ${download.id}`);
                    console.log(`     Date: ${download.downloadedAt}`);
                    console.log(`     Has Book: ${download.hasBook}`);
                    console.log(`     Has User: ${download.hasUser}`);
                    if (download.bookTitle) {
                        console.log(`     Book: ${download.bookTitle}`);
                    }
                    console.log('');
                });
            } else {
                console.log('❌ Aucun téléchargement trouvé dans le debug');
            }
        } catch (error) {
            console.log('❌ Erreur debug:', error.response?.data || error.message);
        }
        
        // 4. Test endpoint principal
        console.log('\n📋 Test endpoint principal...');
        try {
            const downloadsResponse = await axios.get(`${API_BASE}/users/downloads?page=0&size=10`, { headers });
            
            console.log('📊 Résultat endpoint principal:');
            console.log(`- Total elements: ${downloadsResponse.data.totalElements || 0}`);
            console.log(`- Content length: ${downloadsResponse.data.content ? downloadsResponse.data.content.length : 0}`);
            console.log(`- Number of elements: ${downloadsResponse.data.numberOfElements || 0}`);
            console.log(`- Empty: ${downloadsResponse.data.empty}`);
            
            if (downloadsResponse.data.content && downloadsResponse.data.content.length > 0) {
                console.log('\n📚 Contenu retourné:');
                downloadsResponse.data.content.forEach((download, index) => {
                    console.log(`  ${index + 1}. ID: ${download.id}`);
                    console.log(`     Date: ${download.downloadedAt}`);
                    if (download.book) {
                        console.log(`     Book ID: ${download.book.id}`);
                        console.log(`     Title: ${download.book.title}`);
                        console.log(`     Author: ${download.book.author}`);
                        console.log(`     Category: ${download.book.categoryName || 'Non définie'}`);
                    } else {
                        console.log(`     ❌ Pas de livre associé`);
                    }
                    console.log('');
                });
            } else {
                console.log('❌ Aucun contenu retourné par l\'endpoint principal');
            }
            
        } catch (error) {
            console.log('❌ Erreur endpoint principal:', error.response?.data || error.message);
        }
        
        // 5. Test des livres disponibles
        console.log('\n📖 Test des livres disponibles...');
        try {
            const booksResponse = await axios.get(`${API_BASE}/books?size=5`, { headers });
            console.log(`✅ ${booksResponse.data.content ? booksResponse.data.content.length : 0} livres disponibles`);
            
            if (booksResponse.data.content && booksResponse.data.content.length > 0) {
                console.log('Premiers livres:');
                booksResponse.data.content.slice(0, 3).forEach((book, index) => {
                    console.log(`  ${index + 1}. ${book.title} par ${book.author}`);
                });
            }
        } catch (error) {
            console.log('❌ Erreur récupération livres:', error.response?.data || error.message);
        }
        
        console.log('\n🏁 Test terminé');
        
    } catch (error) {
        console.error('❌ Erreur générale:', error.response?.data || error.message);
    }
}

testDownloads();