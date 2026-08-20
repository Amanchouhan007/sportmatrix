const db = require('../../config/db');

/**
 * Fetch all advertisement campaigns
 */
const getAdvertisements = async (req, res) => {
    const { status, type } = req.query;

    try {
        let sql = 'SELECT * FROM advertisements WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (type && type !== 'ALL') {
            sql += ' AND type = ?';
            params.push(type);
        }

        sql += ' ORDER BY created_at DESC';

        const [rows] = await db.query(sql, params);

        const formatted = rows.map(r => ({
            id: r.id,
            _id: r.id,
            name: r.name,
            type: r.type,
            status: r.status,
            icon: r.icon || '📢',
            views: r.views || 0,
            clicks: r.clicks || 0,
            bookings: r.bookings || 0,
            revenue: `₹${(r.revenue || 0).toLocaleString()}`,
            commissionPaid: `₹${(r.commission_paid || 0).toLocaleString()}`,
            ctr: r.ctr || '0%',
            roi: r.roi || '0%',
            cpa: r.cpa || '₹0',
            budgetSpent: r.budget_spent || 0,
            budgetTotal: r.budget_total || 5000,
            dailyBudget: r.daily_budget || 500,
            startDate: r.start_date || '01 Aug 2026',
            endDate: r.end_date || '31 Aug 2026',
            description: r.description || ''
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch advertisements error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching advertisements.'
        });
    }
};

/**
 * Create a new advertisement campaign
 */
const createAdvertisement = async (req, res) => {
    const {
        campaignName,
        name,
        type = 'Guaranteed Booking',
        status = 'Active',
        icon = '📢',
        budgetTotal = 5000,
        dailyBudget = 500,
        startDate,
        endDate,
        description
    } = req.body;

    const adName = campaignName || name;

    if (!adName) {
        return res.status(400).json({
            success: false,
            message: 'Campaign name is required.'
        });
    }

    try {
        const adId = 'AD-' + Math.floor(1000 + Math.random() * 9000);

        await db.query(`
            INSERT INTO advertisements (
                id, branch_id, name, type, status, icon, views, clicks, bookings, revenue,
                commission_paid, ctr, roi, cpa, budget_spent, budget_total, daily_budget,
                start_date, end_date, description
            ) VALUES (?, 'br_001', ?, ?, ?, ?, 0, 0, 0, 0, 0, '0%', '0%', '₹0', 0, ?, ?, ?, ?, ?)
        `, [
            adId,
            adName,
            type,
            status,
            icon,
            Number(budgetTotal) || 5000,
            Number(dailyBudget) || 500,
            startDate || '01 Aug 2026',
            endDate || '31 Aug 2026',
            description || ''
        ]);

        return res.status(201).json({
            success: true,
            message: 'Advertisement campaign published & saved in MySQL DB!',
            data: {
                id: adId,
                name: adName,
                status
            }
        });
    } catch (error) {
        console.error('Create advertisement error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error creating campaign: ' + error.message
        });
    }
};

/**
 * Update advertisement status (Active, Paused, Expired, Rejected)
 */
const updateAdStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [result] = await db.query('UPDATE advertisements SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement campaign not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Campaign status updated to ${status}`
        });
    } catch (error) {
        console.error('Update ad status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating status.'
        });
    }
};

/**
 * Delete an advertisement campaign
 */
const deleteAdvertisement = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM advertisements WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Advertisement campaign not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Advertisement campaign deleted successfully.'
        });
    } catch (error) {
        console.error('Delete advertisement error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting campaign.'
        });
    }
};

/**
 * Fetch commissions and summary stats
 */
const getCommissions = async (req, res) => {
    const { status } = req.query;

    try {
        let sql = 'SELECT * FROM commissions WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND payment_status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const [rows] = await db.query(sql, params);

        // Aggregate summary pools directly from DB
        const [poolRes] = await db.query('SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions');
        const [pendingRes] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions WHERE payment_status = 'Pending'");
        const [settledRes] = await db.query("SELECT COALESCE(SUM(commission_amount), 0) as total FROM commissions WHERE payment_status = 'Paid'");

        const formatted = rows.map(r => ({
            bookingId: r.booking_id,
            adId: r.ad_id,
            adName: r.ad_name,
            turfName: r.turf_name,
            bookingAmount: `₹${Number(r.booking_amount).toLocaleString()}`,
            commission: `₹${Number(r.commission_amount).toLocaleString()} (${r.commission_rate}%)`,
            ownerAmount: `₹${Number(r.owner_amount).toLocaleString()}`,
            invoiceNo: r.invoice_no,
            paymentStatus: r.payment_status,
            date: new Date(r.created_at).toISOString().split('T')[0]
        }));

        return res.status(200).json({
            success: true,
            summary: {
                totalPool: Number(poolRes[0]?.total || 0),
                pendingPayouts: Number(pendingRes[0]?.total || 0),
                settledCommissions: Number(settledRes[0]?.total || 0)
            },
            data: formatted
        });
    } catch (error) {
        console.error('Fetch commissions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching commissions.'
        });
    }
};

/**
 * Mark commission payout status as Paid
 */
const markCommissionPaid = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const [result] = await db.query("UPDATE commissions SET payment_status = 'Paid' WHERE booking_id = ?", [bookingId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Commission record not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Commission for booking ${bookingId} marked as Paid!`
        });
    } catch (error) {
        console.error('Mark commission paid error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating commission status.'
        });
    }
};

module.exports = {
    getAdvertisements,
    createAdvertisement,
    updateAdStatus,
    deleteAdvertisement,
    getCommissions,
    markCommissionPaid
};
