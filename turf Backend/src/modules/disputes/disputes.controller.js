const db = require('../../config/db');

/**
 * Ensure the disputes table exists at startup (soft migration)
 */
const ensureDisputesTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS disputes (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NULL,
                booking_id INT NULL,
                match_id VARCHAR(50) NULL,
                customer_name VARCHAR(100) NOT NULL DEFAULT 'Platform User',
                type ENUM('ESCROW','REFUND','MATCH_RESULT','DAMAGE','CANCELLATION') NOT NULL DEFAULT 'ESCROW',
                amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                reason TEXT NOT NULL,
                status ENUM('OPEN','IN_REVIEW','RESOLVED','REJECTED') NOT NULL DEFAULT 'OPEN',
                resolution_notes TEXT NULL,
                resolved_by_user_id VARCHAR(50) NULL,
                refund_to_wallet TINYINT(1) NOT NULL DEFAULT 0,
                resolution_date DATETIME NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    } catch (e) {
        console.warn('[Disputes] Table auto-creation note:', e.message);
    }
};

ensureDisputesTable();

/**
 * GET /api/v1/disputes
 * List disputes with optional filters: status, type, page, limit
 */
const getDisputes = async (req, res) => {
    try {
        const {
            status,
            type,
            page = 1,
            limit = 20,
            search = ''
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        let where = 'WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
            where += ' AND d.status = ?';
            params.push(status.toUpperCase());
        }
        if (type && type !== 'ALL') {
            where += ' AND d.type = ?';
            params.push(type.toUpperCase());
        }
        if (search) {
            where += ' AND (d.customer_name LIKE ? OR d.reason LIKE ? OR d.id LIKE ?)';
            const s = `%${search}%`;
            params.push(s, s, s);
        }

        const countSql = `SELECT COUNT(*) as total FROM disputes d ${where}`;
        const [[countRow]] = await db.query(countSql, params);
        const total = countRow?.total || 0;

        const sql = `
            SELECT 
                d.*,
                u.name as raisedByName,
                u.email as raisedByEmail,
                ra.name as resolvedByName
            FROM disputes d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN users ra ON d.resolved_by_user_id = ra.id
            ${where}
            ORDER BY 
                CASE d.status 
                    WHEN 'OPEN' THEN 1 
                    WHEN 'IN_REVIEW' THEN 2 
                    WHEN 'RESOLVED' THEN 3 
                    ELSE 4 
                END,
                d.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(Number(limit), offset);
        const [rows] = await db.query(sql, params);

        const disputes = rows.map(r => ({
            id: r.id,
            user: r.raisedByName || r.customer_name || 'Platform User',
            email: r.raisedByEmail || '',
            userId: r.user_id,
            bookingId: r.booking_id,
            matchId: r.match_id,
            type: r.type === 'ESCROW' ? 'Escrow' : r.type === 'REFUND' ? 'Refund' : r.type === 'MATCH_RESULT' ? 'Match Result' : r.type === 'DAMAGE' ? 'Damage' : 'Cancellation',
            rawType: r.type,
            amount: Number(r.amount || 0),
            reason: r.reason,
            status: r.status === 'OPEN' ? 'Open' : r.status === 'IN_REVIEW' ? 'In Review' : r.status === 'RESOLVED' ? 'Resolved' : 'Rejected',
            rawStatus: r.status,
            notes: r.resolution_notes || '',
            resolvedBy: r.resolvedByName || '',
            resolutionDate: r.resolution_date,
            refundToWallet: !!r.refund_to_wallet,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));

        return res.status(200).json({
            success: true,
            count: disputes.length,
            total,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)) || 1
            },
            data: disputes
        });
    } catch (error) {
        console.error('[getDisputes] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching disputes: ' + error.message
        });
    }
};

/**
 * GET /api/v1/disputes/:id
 * Single dispute detail
 */
const getDisputeById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT d.*, 
                u.name as raisedByName, u.email as raisedByEmail,
                ra.name as resolvedByName
            FROM disputes d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN users ra ON d.resolved_by_user_id = ra.id
            WHERE d.id = ?
        `;
        const [rows] = await db.query(sql, [id]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Dispute not found.' });
        }
        const r = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                id: r.id,
                user: r.raisedByName || r.customer_name,
                email: r.raisedByEmail || '',
                type: r.type,
                amount: Number(r.amount),
                reason: r.reason,
                status: r.status,
                notes: r.resolution_notes || '',
                resolvedBy: r.resolvedByName || '',
                resolutionDate: r.resolution_date,
                refundToWallet: !!r.refund_to_wallet,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            }
        });
    } catch (error) {
        console.error('[getDisputeById] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/v1/disputes
 * Create a new dispute (called from booking/match flows)
 */
const createDispute = async (req, res) => {
    try {
        const {
            userId,
            bookingId,
            matchId,
            customerName,
            type = 'ESCROW',
            amount = 0,
            reason,
            refundToWallet = false
        } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ success: false, message: 'Reason is required.' });
        }

        const id = 'DISP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        await db.query(
            `INSERT INTO disputes 
             (id, user_id, booking_id, match_id, customer_name, type, amount, reason, status, refund_to_wallet)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
            [
                id,
                userId || null,
                bookingId || null,
                matchId || null,
                customerName || 'Platform User',
                type.toUpperCase(),
                Number(amount),
                reason.trim(),
                refundToWallet ? 1 : 0
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Dispute raised successfully.',
            data: { id }
        });
    } catch (error) {
        console.error('[createDispute] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PATCH /api/v1/disputes/:id/status
 * Update dispute status (OPEN → IN_REVIEW → RESOLVED/REJECTED)
 */
const updateDisputeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];
        if (!allowed.includes((status || '').toUpperCase())) {
            return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
        }
        await db.query(`UPDATE disputes SET status = ?, updated_at = NOW() WHERE id = ?`, [status.toUpperCase(), id]);
        return res.status(200).json({ success: true, message: `Dispute status updated to ${status.toUpperCase()}` });
    } catch (error) {
        console.error('[updateDisputeStatus] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PATCH /api/v1/disputes/:id/resolve
 * Resolve a dispute with admin resolution notes
 */
const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, refundToWallet = false } = req.body;

        if (!notes || !notes.trim()) {
            return res.status(400).json({ success: false, message: 'Resolution notes are required.' });
        }

        const resolvedByUserId = req.user?.id || null;

        const [result] = await db.query(
            `UPDATE disputes 
             SET status = 'RESOLVED',
                 resolution_notes = ?,
                 resolved_by_user_id = ?,
                 refund_to_wallet = ?,
                 resolution_date = NOW(),
                 updated_at = NOW()
             WHERE id = ?`,
            [notes.trim(), resolvedByUserId, refundToWallet ? 1 : 0, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Dispute not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Dispute resolved successfully.',
            data: { id, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
        });
    } catch (error) {
        console.error('[resolveDispute] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/v1/disputes/stats
 * Summary statistics for super admin dashboard widget
 */
const getDisputeStats = async (req, res) => {
    try {
        const [[stats]] = await db.query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReview,
                SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                COALESCE(SUM(amount), 0) as totalAmount
            FROM disputes
        `);
        return res.status(200).json({
            success: true,
            data: {
                total: Number(stats.total || 0),
                open: Number(stats.open || 0),
                inReview: Number(stats.inReview || 0),
                resolved: Number(stats.resolved || 0),
                rejected: Number(stats.rejected || 0),
                totalAmount: Number(stats.totalAmount || 0)
            }
        });
    } catch (error) {
        console.error('[getDisputeStats] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDisputes,
    getDisputeById,
    createDispute,
    updateDisputeStatus,
    resolveDispute,
    getDisputeStats
};
