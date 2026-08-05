require('dotenv').config();
const app = require('./app');
const initializeDatabase = require('./config/initDb');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log('--- SportMatrix Server Boot Sequence ---');
        
        // Initialize Database schemas and seed data
        try {
            await initializeDatabase();
        } catch (dbErr) {
            console.error('\n===============================================================');
            console.error('⚠️  DATABASE INITIALIZATION FAILED');
            console.error('===============================================================');
            console.error(`Error: ${dbErr.message}`);
            console.error('👉 Please check your MySQL setup:');
            console.error('1. Make sure MySQL service (XAMPP / MySQL Workbench / Service) is RUNNING.');
            console.error('2. Open "turf Backend/.env" and set your MySQL password:');
            console.error('   DB_PASSWORD=your_mysql_password');
            console.error('===============================================================\n');
        }
        
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
