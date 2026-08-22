const db = require('../../config/db');

const getTickets = async (req, res) => {
    try {
        const ownerFilter = req.query.ownerId || req.query.owner_id || (req.user?.role === 'OWNER' ? req.user.id : null);
        const emailFilter = req.query.email || req.user?.email;

        let sql = 'SELECT * FROM maintenance_tickets WHERE 1=1';
        const params = [];
        if (req.user?.role === 'OWNER' || (ownerFilter && ownerFilter !== 'ALL')) {
            sql += ' AND (branch_id IN (SELECT id FROM branches WHERE owner_id = ? OR owner_id IN (SELECT id FROM owners WHERE email = ? OR user_id = ? OR id = ?) OR email = ?) OR created_by = ? OR created_by = ?)';
            params.push(ownerFilter || '', emailFilter || '', ownerFilter || '', ownerFilter || '', emailFilter || '', ownerFilter || '', emailFilter || '');
        }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createTicket = async (req, res) => {
    const { assetName, category, issueDescription, priority, cost, assignedTo } = req.body;
    try {
        const ticketId = `tkt_${Date.now()}`;
        await db.query(`
            INSERT INTO maintenance_tickets (id, asset_name, category, issue_description, priority, cost, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            ticketId,
            assetName || 'Equipment Asset',
            category || 'Equipment',
            issueDescription || 'Maintenance check required',
            priority || 'MEDIUM',
            cost || 0,
            assignedTo || 'Unassigned'
        ]);

        return res.status(201).json({
            success: true,
            data: { id: ticketId, assetName, category, issueDescription, priority, cost, assignedTo, status: 'PENDING' }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status, cost } = req.body;
    try {
        await db.query('UPDATE maintenance_tickets SET status = ?, cost = COALESCE(?, cost) WHERE id = ?', [status, cost, id]);
        return res.status(200).json({ success: true, message: 'Ticket updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTicket = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM maintenance_tickets WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTickets, createTicket, updateTicketStatus, deleteTicket };
