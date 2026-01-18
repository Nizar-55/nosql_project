const { execSync } = require('child_process');

function testNeo4jConnection() {
    console.log('🔍 Test de connexion Neo4j...\n');
    
    // Test 1: Vérifier le port 7687
    console.log('1. Test du port 7687...');
    try {
        const result = execSync('powershell "Test-NetConnection -ComputerName localhost -Port 7687"', { encoding: 'utf8' });
        if (result.includes('TcpTestSucceeded       : True')) {
            console.log('✅ Port 7687 accessible');
        } else {
            console.log('❌ Port 7687 non accessible');
            console.log('   → Démarrez une base de données dans Neo4j Desktop');
            return false;
        }
    } catch (error) {
        console.log('❌ Erreur lors du test du port:', error.message);
        return false;
    }
    
    // Test 2: Vérifier le port 7474 (Neo4j Browser)
    console.log('\n2. Test du port 7474 (Neo4j Browser)...');
    try {
        const result = execSync('powershell "Test-NetConnection -ComputerName localhost -Port 7474"', { encoding: 'utf8' });
        if (result.includes('TcpTestSucceeded       : True')) {
            console.log('✅ Port 7474 accessible');
            console.log('   → Neo4j Browser disponible sur http://localhost:7474');
        } else {
            console.log('⚠️  Port 7474 non accessible (optionnel)');
        }
    } catch (error) {
        console.log('⚠️  Erreur lors du test du port 7474');
    }
    
    // Test 3: Tester la connexion backend
    console.log('\n3. Test de connexion du backend...');
    try {
        const result = execSync('curl -s http://localhost:8083/api/books/test/ping', { encoding: 'utf8' });
        const data = JSON.parse(result);
        console.log('✅ Backend accessible:', data.message);
        return true;
    } catch (error) {
        console.log('❌ Backend non accessible ou erreur de connexion Neo4j');
        console.log('   → Redémarrez le backend après avoir démarré Neo4j');
        return false;
    }
}

const success = testNeo4jConnection();

if (success) {
    console.log('\n🎉 Connexion Neo4j réussie!');
    console.log('\nProchaines étapes:');
    console.log('1. Testez les couvertures: node test-after-neo4j-start.cjs');
    console.log('2. Accédez au frontend: http://localhost:3000');
} else {
    console.log('\n❌ Connexion Neo4j échouée');
    console.log('\nActions requises:');
    console.log('1. Ouvrez Neo4j Desktop');
    console.log('2. Démarrez une base de données (mot de passe: Islam2004)');
    console.log('3. Relancez ce test: node test-neo4j-connection.cjs');
}