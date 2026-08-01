const app = require('./app');
const initializeDatabase = require('./config/initDb');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('--- SportMatrix Server Boot Sequence ---');
        
        // Initialize Database schemas and seed data
        await initializeDatabase();
        
        // Start server listening
        app.listen(PORT, () => {
            console.log(`Server successfully started listening on port ${PORT}`);
            console.log(`Health check URL: http://localhost:${PORT}/api/v1/health`);
            console.log('----------------------------------------');
        });
    } catch (error) {
        console.error('Server startup halted due to errors:', error);
        process.exit(1);
    }
}

startServer();
