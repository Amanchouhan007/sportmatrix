const db = require('../../config/db');

/**
 * Get overview dashboard stats reports
 */
const getOverviewReport = async (req, res) => {
    try {
        // Revenue calculations (Booking Payments + Subscription Plan Revenue)
        const [revenueRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED'`);
        const [monthlyRevRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`);
        const [yearlyRevRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED' AND YEAR(created_at) = YEAR(CURRENT_DATE())`);

        let subPlanRev = 0;
        try {
            const [branchPlanRes] = await db.query(`
                SELECT COALESCE(SUM(sp.monthly_price), 0) as total
                FROM branches b
                LEFT JOIN subscription_plans sp ON (b.subscription_plan_id = sp.id OR LOWER(b.subscription_plan_id) = LOWER(sp.plan_name))
                WHERE b.status = 'ACTIVE'
            `);
            const [ownerSubRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM owner_subscriptions WHERE payment_status = 'COMPLETED'`);
            subPlanRev = Math.max(Number(branchPlanRes[0]?.total || 0), Number(ownerSubRes[0]?.total || 0));
        } catch (e) {}

        const totalRevenue = Number(revenueRes[0]?.total || 0) + subPlanRev;
        const monthlyRevenue = Number(monthlyRevRes[0]?.total || 0) + subPlanRev;
        const yearlyRevenue = Number(yearlyRevRes[0]?.total || 0) + subPlanRev;

        // Bookings calculations
        const [totalBookingsRes] = await db.query(`SELECT COUNT(*) as total FROM bookings`);
        const [todayBookingsRes] = await db.query(`SELECT COUNT(*) as total FROM bookings WHERE DATE(created_at) = CURDATE()`);
        const [monthlyBookingsRes] = await db.query(`SELECT COUNT(*) as total FROM bookings WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`);
        const [cancelledBookingsRes] = await db.query(`SELECT COUNT(*) as total FROM bookings WHERE status = 'CANCELLED'`);

        const totalBookings = Number(totalBookingsRes[0]?.total || 0);
        const todayBookings = Number(todayBookingsRes[0]?.total || 0);
        const monthlyBookings = Number(monthlyBookingsRes[0]?.total || 0);
        const cancelledBookings = Number(cancelledBookingsRes[0]?.total || 0);

        // User role breakdowns (Registered Owners / Admins)
        const [ownersRes] = await db.query(`SELECT COUNT(*) as total FROM owners`);
        const [staffRes] = await db.query(`SELECT COUNT(*) as total FROM users WHERE role = 'STAFF'`);
        const [customersRes] = await db.query(`SELECT COUNT(*) as total FROM users WHERE role = 'CUSTOMER'`);
        const [newRegsRes] = await db.query(`SELECT COUNT(*) as total FROM users WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())`);

        const totalOwners = Number(ownersRes[0]?.total || 0);
        const totalStaff = Number(staffRes[0]?.total || 0);
        const totalCustomers = Number(customersRes[0]?.total || 0);
        const newRegistrations = Number(newRegsRes[0]?.total || 0);

        // Turfs / Branches calculations
        const [totalBranchesRes] = await db.query(`SELECT COUNT(*) as total FROM branches`);
        const [activeBranchesRes] = await db.query(`SELECT COUNT(*) as total FROM branches WHERE status = 'ACTIVE'`);
        const [inactiveBranchesRes] = await db.query(`SELECT COUNT(*) as total FROM branches WHERE status = 'INACTIVE'`);
        const [suspendedBranchesRes] = await db.query(`SELECT COUNT(*) as total FROM branches WHERE status = 'SUSPENDED'`);

        const totalBranches = Number(totalBranchesRes[0]?.total || 0);
        const activeBranches = Number(activeBranchesRes[0]?.total || 0);
        const inactiveBranches = Number(inactiveBranchesRes[0]?.total || 0);
        const suspendedBranches = Number(suspendedBranchesRes[0]?.total || 0);

        return res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                monthlyRevenue,
                yearlyRevenue,
                revenueGrowthPercentage: 0,
                totalBookings,
                todayBookings,
                monthlyBookings,
                cancelledBookings,
                totalOwners,
                totalStaff,
                totalCustomers,
                newRegistrations,
                totalBranches,
                activeBranches,
                suspendedBranches,
                inactiveBranches
            }
        });
    } catch (error) {
        console.error('Fetch overview report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling overview report: ' + error.message
        });
    }
};

/**
 * Get monthly revenue analytics
 */
const getRevenueReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as Month, 
                COALESCE(SUM(amount), 0) as Revenue 
            FROM payments
            WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `);

        const formattedRows = rows.map(r => ({
            Month: r.Month,
            Revenue: Number(r.Revenue || 0),
            month: r.Month,
            revenue: Number(r.Revenue || 0),
            label: r.Month,
            v: Number(r.Revenue || 0),
            m: r.Month
        }));

        return res.status(200).json({
            success: true,
            data: formattedRows
        });
    } catch (error) {
        console.error('Fetch revenue report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling revenue report: ' + error.message
        });
    }
};

/**
 * Get monthly bookings analytics
 */
const getBookingReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as month, 
                SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as completed, 
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled 
            FROM bookings
            WHERE created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `);

        const formatted = rows.map(r => ({
            month: r.month,
            completed: Number(r.completed || 0),
            cancelled: Number(r.cancelled || 0)
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch bookings report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling bookings report: ' + error.message
        });
    }
};

/**
 * Get User Analytics Growth by Role from DB
 */
const getUserAnalyticsReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as label,
                SUM(CASE WHEN role = 'OWNER' THEN 1 ELSE 0 END) as OWNER,
                SUM(CASE WHEN role = 'STAFF' THEN 1 ELSE 0 END) as STAFF,
                SUM(CASE WHEN role = 'CUSTOMER' THEN 1 ELSE 0 END) as CUSTOMER,
                COUNT(*) as total
            FROM users
            GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `);

        const formatted = rows.map(r => ({
            label: r.label,
            OWNER: Number(r.OWNER || 0),
            STAFF: Number(r.STAFF || 0),
            CUSTOMER: Number(r.CUSTOMER || 0),
            total: Number(r.total || 0)
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('User analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling user analytics: ' + error.message
        });
    }
};

/**
 * Get Subscription Analytics Breakdown from DB
 */
const getSubscriptionAnalyticsReport = async (req, res) => {
    try {
        const [plans] = await db.query(`
            SELECT 
                sp.plan_name as planName,
                sp.monthly_price as price,
                COUNT(b.id) as count
            FROM subscription_plans sp
            INNER JOIN branches b ON (b.status = 'ACTIVE' AND (b.subscription_plan_id = sp.id OR LOWER(b.subscription_plan_id) = LOWER(sp.plan_name)))
            GROUP BY sp.id, sp.plan_name, sp.monthly_price
            HAVING count > 0
            ORDER BY count DESC
        `);

        const formatted = plans.map(p => ({
            planName: p.planName,
            price: Number(p.price || 0),
            count: Number(p.count || 0),
            totalUsers: Number(p.count || 0),
            revenue: Number(p.price || 0) * Number(p.count || 0),
            name: p.planName,
            value: Number(p.count || 0)
        }));

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Subscription analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling subscription analytics: ' + error.message
        });
    }
};

/**
 * Get Top Venue Owners from DB
 */
const getTopOwnersReport = async (req, res) => {
    try {
        const [owners] = await db.query(`
            SELECT 
                o.id as _id,
                o.id as id,
                o.full_name as fullName,
                o.full_name as ownerName,
                COUNT(br.id) as branchesCount,
                COUNT(br.id) as branches,
                COALESCE(SUM(b.amount), 0) as revenue
            FROM owners o
            LEFT JOIN branches br ON br.owner_id = o.id
            LEFT JOIN slots s ON s.branch_id = br.id
            LEFT JOIN bookings b ON b.slot_id = s.id
            GROUP BY o.id, o.full_name
            ORDER BY revenue DESC
        `);

        return res.status(200).json({
            success: true,
            data: owners.map(o => ({
                _id: o._id,
                id: o.id,
                fullName: o.fullName || 'Venue Owner',
                ownerName: o.ownerName || 'Venue Owner',
                branchesCount: Number(o.branchesCount || 0),
                branches: Number(o.branches || 0),
                revenue: Number(o.revenue || 0)
            }))
        });
    } catch (error) {
        console.error('Top owners error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling top owners: ' + error.message
        });
    }
};

/**
 * Get Top Branches from DB
 */
const getTopBranchesReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                br.id as _id,
                br.id as id,
                br.branch_name as branchName,
                br.city as city,
                COALESCE(o.full_name, 'Turf Owner') as ownerName,
                COUNT(b.id) as bookingsCount,
                COUNT(b.id) as bookings,
                COALESCE(SUM(b.amount), 0) as revenue
            FROM branches br
            LEFT JOIN owners o ON br.owner_id = o.id
            LEFT JOIN slots s ON s.branch_id = br.id
            LEFT JOIN bookings b ON b.slot_id = s.id
            GROUP BY br.id, br.branch_name, br.city, o.full_name
            ORDER BY revenue DESC
            LIMIT 5
        `);

        return res.status(200).json({
            success: true,
            data: rows || []
        });
    } catch (error) {
        console.error('Top branches error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling top branches: ' + error.message
        });
    }
};

/**
 * Get Sports Popularity Reports from DB
 */
const getSportsReport = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                sp.name as sport,
                sp.name as name,
                COUNT(b.id) as bookingsCount,
                COUNT(b.id) as bookings,
                COALESCE(SUM(b.amount), 0) as revenue
            FROM sports sp
            LEFT JOIN bookings b ON b.sport_name = sp.name
            GROUP BY sp.id, sp.name
        `);

        return res.status(200).json({
            success: true,
            data: rows.map(r => ({
                sport: r.sport,
                name: r.name,
                bookingsCount: Number(r.bookingsCount || 0),
                bookings: Number(r.bookings || 0),
                revenue: Number(r.revenue || 0)
            }))
        });
    } catch (error) {
        console.error('Fetch sports report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling sports report: ' + error.message
        });
    }
};

const getDailyReport = async (req, res) => {
    return res.status(200).json({ success: true, data: [] });
};

const getMonthlyReport = async (req, res) => {
    return res.status(200).json({ success: true, data: [] });
};

module.exports = {
    getOverviewReport,
    getRevenueReport,
    getBookingReport,
    getUserAnalyticsReport,
    getSubscriptionAnalyticsReport,
    getTopOwnersReport,
    getTopBranchesReport,
    getSportsReport,
    getDailyReport,
    getMonthlyReport
};
