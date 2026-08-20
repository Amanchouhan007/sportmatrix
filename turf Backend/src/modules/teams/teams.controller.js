const db = require('../../config/db');

const getTeams = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM teams ORDER BY created_at DESC');
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createTeam = async (req, res) => {
    const { name, captainName, captainPhone, sport, membersCount } = req.body;
    try {
        const teamId = `tm_${Date.now()}`;
        await db.query(`
            INSERT INTO teams (id, name, captain_name, captain_phone, sport, members_count)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            teamId,
            name,
            captainName,
            captainPhone,
            sport || 'Cricket',
            membersCount || 11
        ]);
        return res.status(201).json({ success: true, data: { id: teamId, name, captainName, captainPhone, sport, membersCount } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeams, createTeam };
