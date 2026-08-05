const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turf_db'
};

const getTurfs = async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM turfs WHERE status = "ACTIVE"');
        await connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching turfs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getTurfsNearby = async (req, res) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        const connection = await mysql.createConnection(dbConfig);
        // Haversine formula
        const query = `
            SELECT *, 
            ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance
            FROM turfs 
            WHERE status = 'ACTIVE'
            HAVING distance <= ?
            ORDER BY distance ASC
        `;
        const [rows] = await connection.execute(query, [lat, lng, lat, radius]);
        await connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching nearby turfs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const searchTurfs = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: 'Query is required' });
        
        const connection = await mysql.createConnection(dbConfig);
        const sql = `SELECT * FROM turfs WHERE status = 'ACTIVE' AND (name LIKE ? OR city LIKE ?)`;
        const wildcardQuery = `%${query}%`;
        const [rows] = await connection.execute(sql, [wildcardQuery, wildcardQuery]);
        await connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error searching turfs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const filterTurfs = async (req, res) => {
    try {
        const { lat, lng, radius, sport, minPrice, maxPrice, rating, limit = 20 } = req.query;
        let connection = await mysql.createConnection(dbConfig);
        
        let query = 'SELECT *';
        let queryParams = [];
        let havingClause = '';
        
        if (lat && lng) {
            query += `, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance`;
            queryParams.push(lat, lng, lat);
        }
        
        query += ` FROM turfs WHERE status = 'ACTIVE'`;
        
        if (sport) {
            query += ` AND JSON_CONTAINS(sports, ?)`;
            queryParams.push(`"${sport}"`);
        }
        if (minPrice) {
            query += ` AND price >= ?`;
            queryParams.push(minPrice);
        }
        if (maxPrice) {
            query += ` AND price <= ?`;
            queryParams.push(maxPrice);
        }
        if (rating) {
            query += ` AND rating >= ?`;
            queryParams.push(rating);
        }
        
        if (lat && lng && radius) {
            havingClause = ` HAVING distance <= ?`;
            queryParams.push(radius);
        }
        
        query += havingClause;
        
        if (lat && lng) {
            query += ` ORDER BY distance ASC`;
        } else {
            query += ` ORDER BY rating DESC`;
        }
        
        query += ` LIMIT ?`;
        queryParams.push(Number(limit));

        const [rows] = await connection.execute(query, queryParams);
        await connection.end();
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error filtering turfs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getTurfById = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM turfs WHERE id = ?', [id]);
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Turf not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching turf by id:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateTurfMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { media } = req.body;
        if (!media || !Array.isArray(media)) {
            return res.status(400).json({ success: false, message: 'Media array is required' });
        }

        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE turfs SET media = ? WHERE id = ?', [JSON.stringify(media), id]);
        await connection.end();

        res.json({ success: true, message: 'Turf media updated successfully', media });
    } catch (error) {
        console.error('Error updating turf media:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getTurfs,
    getTurfById,
    getTurfsNearby,
    searchTurfs,
    filterTurfs,
    updateTurfMedia
};
