const db = require('../../config/db');

/**
 * Fetch all advertisement campaigns
 */
const getAdvertisements = async (req, res) => {
    const { status, type } = req.query;

    try {
        let sql = `
            SELECT 
                a.*,
                br.branch_name as turfName,
                br.city as city,
                o.full_name as ownerName,
                o.email as ownerEmail,
                o.mobile as ownerMobile
            FROM advertisements a
            LEFT JOIN branches br ON a.branch_id = br.id
            LEFT JOIN owners o ON a.owner_id = o.id
            WHERE 1=1
        `;
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND a.status = ?';
            params.push(status);
        }
        if (type && type !== 'ALL') {
            sql += ' AND a.type = ?';
            params.push(type);
        }

        sql += ' ORDER BY a.created_at DESC';

        const [rows] = await db.query(sql, params);

        const formatted = rows.map(r => ({
            id: r.id,
            _id: r.id,
            name: r.name || 'Ad Campaign',
            turfName: r.turfName || 'Indore Strikers Arena',
            ownerName: r.ownerName || 'Aman chouhan',
            ownerEmail: r.ownerEmail || 'aman@gmail.com',
            ownerMobile: r.ownerMobile || '2345234566',
            type: r.type || 'Guaranteed Booking',
            status: r.status || 'Active',
            icon: r.icon || '📢',
            views: Number(r.views || 0),
            clicks: Number(r.clicks || 0),
            bookings: Number(r.bookings || 0),
            revenue: `₹${Number(r.revenue || 0).toLocaleString()}`,
            commissionPaid: `₹${Number(r.commission_paid || 0).toLocaleString()}`,
            ctr: r.ctr || '0%',
            roi: r.roi || '0%',
            cpa: r.cpa || '₹0',
            budgetSpent: Number(r.budget_spent || 0),
            budgetTotal: Number(r.budget_total || 5000),
            dailyBudget: Number(r.daily_budget || 500),
            startDate: r.start_date ? new Date(r.start_date).toISOString().split('T')[0] : '2026-08-01',
            endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : '2026-08-31',
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

/**
 * Fetch ad payments and invoices
 */
const getPayments = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id as invoiceId,
                p.id as _id,
                COALESCE(p.invoice_number, p.id) as invoiceNo,
                p.customer_name as ownerName,
                p.amount as amount,
                p.payment_method as paymentMethod,
                p.status as status,
                p.created_at as createdAt,
                DATE_FORMAT(p.created_at, '%Y-%m-%d') as date
            FROM payments p
            ORDER BY p.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: rows.map(r => ({
                invoiceId: r.invoiceNo || r.invoiceId,
                adName: 'Ad Campaign Settlement',
                adId: 'AD-1001',
                turfName: 'Indore Strikers Arena',
                ownerName: r.ownerName || 'Aman chouhan',
                amount: `₹${Number(r.amount || 0).toLocaleString()}`,
                paymentMethod: r.paymentMethod || 'UPI Settlement',
                status: r.status === 'COMPLETED' ? 'Paid' : 'Pending',
                date: r.date || new Date().toISOString().split('T')[0]
            }))
        });
    } catch (error) {
        console.error('Fetch ad payments error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching ad payments: ' + error.message
        });
    }
};

/**
 * Fetch ad analytics breakdown
 */
const getAdAnalytics = async (req, res) => {
    try {
        const [ads] = await db.query('SELECT * FROM advertisements');
        const totalAds = ads.length;
        const activeAds = ads.filter(a => (a.status || '').toLowerCase() === 'active').length;
        const totalRevenue = ads.reduce((sum, a) => sum + Number(a.revenue || 0), 0);
        const adBookings = ads.reduce((sum, a) => sum + Number(a.bookings || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                totalAds,
                activeAds,
                totalRevenue,
                adBookings,
                campaigns: ads
            }
        });
    } catch (error) {
        console.error('Fetch ad analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching ad analytics: ' + error.message
        });
    }
};

/**
 * Update advertisement content (name, budget, dates, description)
 */
const updateAdvertisement = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        campaignName,
        budgetTotal,
        dailyBudget,
        startDate,
        endDate,
        description,
        type
    } = req.body;

    try {
        const adName = campaignName || name;
        const updateFields = [];
        const values = [];

        if (adName) { updateFields.push('name = ?'); values.push(adName); }
        if (type) { updateFields.push('type = ?'); values.push(type); }
        if (budgetTotal !== undefined) { updateFields.push('budget_total = ?'); values.push(Number(budgetTotal)); }
        if (dailyBudget !== undefined) { updateFields.push('daily_budget = ?'); values.push(Number(dailyBudget)); }
        if (startDate) { updateFields.push('start_date = ?'); values.push(startDate); }
        if (endDate) { updateFields.push('end_date = ?'); values.push(endDate); }
        if (description !== undefined) { updateFields.push('description = ?'); values.push(description); }

        if (updateFields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        values.push(id);
        const [result] = await db.query(
            `UPDATE advertisements SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Advertisement not found.' });
        }

        return res.status(200).json({
            success: true,
            message: 'Advertisement updated successfully.',
            data: { id }
        });
    } catch (error) {
        console.error('Update advertisement error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating advertisement: ' + error.message
        });
    }
};

module.exports = {
    getAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    updateAdStatus,
    deleteAdvertisement,
    getCommissions,
    markCommissionPaid,
    getPayments,
    getAdAnalytics
};
