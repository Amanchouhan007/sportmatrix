const db = require('../../config/db');

const getStaff = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM staff_members ORDER BY created_at DESC');
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createStaff = async (req, res) => {
    const { name, email, phone, role, assignedBranch, shift } = req.body;
    try {
        const staffId = `stf_${Date.now()}`;
        await db.query(`
            INSERT INTO staff_members (id, name, email, phone, role, assigned_branch, shift)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            staffId,
            name,
            email || '',
            phone,
            role || 'Court Attendant',
            assignedBranch || 'SportZone Arena',
            shift || 'Morning'
        ]);
        return res.status(201).json({ success: true, data: { id: staffId, name, email, phone, role, assignedBranch, shift } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM staff_members WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Staff member deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getStaff, createStaff, deleteStaff };
