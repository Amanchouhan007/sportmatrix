const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turf_db'
};

async function seedTurfs() {
    let connection = await mysql.createConnection(dbConfig);
    console.log('Seeding turfs...');
    await connection.query(`
        CREATE TABLE IF NOT EXISTS turfs (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(150),
            address TEXT,
            city VARCHAR(100),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            price INT DEFAULT 0,
            rating DECIMAL(2, 1) DEFAULT 0.0,
            sports JSON,
            amenities JSON,
            opening_time TIME DEFAULT '06:00:00',
            closing_time TIME DEFAULT '23:00:00',
            status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    try {
        await connection.query(`
            INSERT IGNORE INTO turfs (id, name, slug, address, city, latitude, longitude, price, rating, sports, amenities, opening_time, closing_time) VALUES
            ('turf_1', 'Green Arena Football Turf', 'green-arena', 'Andheri West, Mumbai', 'Mumbai', 19.1136, 72.8697, 1200, 4.8, '["Football"]', '["Floodlights", "Parking", "Washroom"]', '06:00:00', '23:00:00'),
            ('turf_2', 'Champion Cricket Academy', 'champion-cricket', 'Koramangala, Bangalore', 'Bangalore', 12.9352, 77.6245, 1500, 4.9, '["Cricket"]', '["Floodlights", "Seating", "Drinking Water"]', '06:00:00', '22:00:00'),
            ('turf_4', 'Elite Sports Complex', 'elite-sports', 'Whitefield, Bangalore', 'Bangalore', 12.9698, 77.7500, 2000, 4.6, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Washroom"]', '06:00:00', '23:00:00'),
            ('turf_5', 'ProPlay Arena', 'proplay-arena', 'Vashi, Navi Mumbai', 'Mumbai', 19.0330, 73.0297, 1000, 4.5, '["Football"]', '["Floodlights", "Parking"]', '07:00:00', '23:00:00'),
            ('turf_6', 'Royal Cricket Ground', 'royal-cricket', 'Vijay Nagar, Indore', 'Indore', 22.7533, 75.8937, 600, 4.7, '["Cricket"]', '["Floodlights", "Parking", "Drinking Water"]', '06:00:00', '23:00:00'),
            ('turf_9', 'Skyline Football Turf', 'skyline-football', 'Powai, Mumbai', 'Mumbai', 19.1176, 72.9060, 1400, 4.6, '["Football"]', '["Floodlights", "Washroom"]', '06:00:00', '23:00:00'),
            ('turf_11', 'Master Blaster Cricket', 'master-blaster', 'Saket, Delhi', 'Delhi', 28.5244, 77.2167, 1100, 4.8, '["Cricket"]', '["Floodlights", "Equipment"]', '06:00:00', '23:00:00'),
            ('turf_13', 'Spike Football Turf', 'spike-football', 'Bhawarkua, Indore', 'Indore', 22.6953, 75.8690, 500, 4.6, '["Football"]', '["Floodlights", "Parking", "Washroom"]', '06:00:00', '23:00:00'),
            ('turf_14', 'Indore Sports Arena', 'indore-sports-arena', 'LIG Colony, Indore', 'Indore', 22.7380, 75.8916, 800, 4.9, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Washroom", "AC"]', '06:00:00', '23:00:00'),
            ('turf_15', 'Rajiv Gandhi Stadium Turf', 'rajiv-gandhi-stadium', 'Navlakha, Indore', 'Indore', 22.7000, 75.8752, 700, 4.5, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Drinking Water"]', '06:00:00', '23:00:00');
        `);
        console.log('Seeded turfs!');
    } catch(err) {
        console.error(err);
    }
    await connection.end();
}

seedTurfs();
