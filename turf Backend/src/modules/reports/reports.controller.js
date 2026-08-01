const db = require('../../config/db');

/**
 * Get overview dashboard stats reports
 */
const getOverviewReport = async (req, res) => {
    const { branchId } = req.query;

    try {
        let revenueSql = "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status='COMPLETED'";
        let bookingsSql = "SELECT COUNT(*) as total FROM bookings WHERE status='CONFIRMED'";
        let branchesSql = "SELECT COUNT(*) as total FROM branches WHERE status='ACTIVE'";
        let usersSql = "SELECT COUNT(*) as total FROM users WHERE role='CUSTOMER'";
        
        const params = [];
        if (branchId) {
            // Restrict revenue and bookings counts by branch
            revenueSql = `
                SELECT COALESCE(SUM(p.amount), 0) as total 
                FROM payments p
                LEFT JOIN bookings b ON p.booking_id = b.id
                LEFT JOIN slots sl ON b.slot_id = sl.id
                WHERE p.status='COMPLETED' AND sl.branch_id = ?
            `;
            bookingsSql = `
                SELECT COUNT(*) as total 
                FROM bookings b
                JOIN slots sl ON b.slot_id = sl.id
                WHERE b.status='CONFIRMED' AND sl.branch_id = ?
            `;
            params.push(branchId);
        }

        const [[revenueRes]] = await db.query(revenueSql, params);
        const [[bookingsRes]] = await db.query(bookingsSql, params);
        const [[branchesRes]] = await db.query(branchesSql);
        const [[usersRes]] = await db.query(usersSql);

        return res.status(200).json({
            success: true,
            data: {
                totalRevenue: revenueRes.total,
                revenueGrowth: 12.5, // Mock baseline
                totalBookings: bookingsRes.total,
                bookingGrowth: 8.4,
                totalUsers: usersRes.total,
                userGrowth: 15.2,
                activeBranches: branchesRes.total,
                branchGrowth: 5.0
            }
        });
    } catch (error) {
        console.error('Fetch overview report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling overview report.'
        });
    }
};

/**
 * Get monthly revenue analytics
 */
const getRevenueReport = async (req, res) => {
    const { branchId } = req.query;

    try {
        let sql = `
            SELECT DATE_FORMAT(p.created_at, '%Y-%m') as label, SUM(p.amount) as revenue 
            FROM payments p
        `;
        const params = [];

        if (branchId) {
            sql += `
                LEFT JOIN bookings b ON p.booking_id = b.id
                LEFT JOIN slots sl ON b.slot_id = sl.id
                WHERE p.status='COMPLETED' AND sl.branch_id = ?
            `;
            params.push(branchId);
        } else {
            sql += " WHERE p.status='COMPLETED'";
        }

        sql += " GROUP BY label ORDER BY label ASC";

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch revenue report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling revenue report.'
        });
    }
};

/**
 * Get monthly bookings analytics
 */
const getBookingReport = async (req, res) => {
    const { branchId } = req.query;

    try {
        let sql = `
            SELECT 
                DATE_FORMAT(b.created_at, '%b') as month, 
                SUM(CASE WHEN b.status = 'CONFIRMED' THEN 1 ELSE 0 END) as completed, 
                SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled 
            FROM bookings b
        `;
        const params = [];

        if (branchId) {
            sql += `
                JOIN slots sl ON b.slot_id = sl.id
                WHERE sl.branch_id = ?
            `;
            params.push(branchId);
        }

        sql += " GROUP BY month ORDER BY MIN(b.created_at) ASC";

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch bookings report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling bookings report.'
        });
    }
};

/**
 * Get sports popularity stats shares
 */
const getSportsReport = async (req, res) => {
    const { branchId } = req.query;

    try {
        let sql = `
            SELECT 
                s.name as name, 
                COUNT(b.id) as bookings, 
                SUM(b.amount) as total_revenue
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            JOIN sports s ON sl.sport_id = s.id
            WHERE b.status = 'CONFIRMED'
        `;
        const params = [];

        if (branchId) {
            sql += " AND sl.branch_id = ?";
            params.push(branchId);
        }

        sql += " GROUP BY s.name ORDER BY bookings DESC";

        const [rows] = await db.query(sql, params);

        const totalBookingsCount = rows.reduce((sum, r) => sum + r.bookings, 0);

        const formatted = rows.map(r => ({
            name: r.name,
            bookings: r.bookings,
            share: totalBookingsCount > 0 ? Math.round((r.bookings / totalBookingsCount) * 100) : 0,
            revenue: `₹${Number(r.total_revenue).toLocaleString()}`
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch sports report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling sports report.'
        });
    }
};

/**
 * Get daily revenue statement reports
 */
const getDailyReport = async (req, res) => {
    const { branchId, month } = req.query; // format: YYYY-MM

    try {
        let sql = `
            SELECT 
                DATE_FORMAT(b.created_at, '%Y-%m-%d') as date, 
                SUM(b.amount) as revenue,
                COUNT(b.id) as bookingsCount
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            WHERE b.status = 'CONFIRMED'
        `;
        const params = [];

        if (branchId) {
            sql += " AND sl.branch_id = ?";
            params.push(branchId);
        }
        if (month) {
            sql += " AND DATE_FORMAT(b.created_at, '%Y-%m') = ?";
            params.push(month);
        }

        sql += " GROUP BY date ORDER BY date ASC";

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch daily report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling daily report.'
        });
    }
};

/**
 * Get monthly revenue statement reports
 */
const getMonthlyReport = async (req, res) => {
    const { branchId, year } = req.query; // format: YYYY

    try {
        let sql = `
            SELECT 
                DATE_FORMAT(b.created_at, '%M') as month, 
                SUM(b.amount) as revenue,
                COUNT(b.id) as bookingsCount
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            WHERE b.status = 'CONFIRMED'
        `;
        const params = [];

        if (branchId) {
            sql += " AND sl.branch_id = ?";
            params.push(branchId);
        }
        if (year) {
            sql += " AND DATE_FORMAT(b.created_at, '%Y') = ?";
            params.push(year);
        }

        sql += " GROUP BY month ORDER BY MIN(b.created_at) ASC";

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch monthly report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling monthly report.'
        });
    }
};

module.exports = {
    getOverviewReport,
    getRevenueReport,
    getBookingReport,
    getSportsReport,
    getDailyReport,
    getMonthlyReport
};
