const db = require('../../config/db');

/**
 * Get unified dashboard summary calculations for Super Admin
 */
const getDashboardSummary = async (req, res) => {
    try {
        const ownerId = req.query.ownerId || req.query.owner_id || (req.user?.role === 'OWNER' ? req.user.id : null);
        const userEmail = req.query.email || req.user?.email || ownerId;

        if (ownerId) {
            const [ownerBranches] = await db.query(
                `SELECT id FROM branches WHERE owner_id = ? OR owner_id = (SELECT id FROM owners WHERE email = ? OR id = ?) OR email = ?`,
                [ownerId, userEmail, ownerId, userEmail]
            );
            const turfIds = ownerBranches.map(t => t.id);

            let todaysRev = 0;
            let todaysBookings = 0;
            let totalRev = 0;
            let activeMatches = 0;
            let availableSlots = 0;
            let recentBookings = [];

            if (turfIds.length > 0) {
                const placeholders = turfIds.map(() => '?').join(',');

                const [todayRevRes] = await db.query(
                    `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED' AND DATE(created_at) = CURDATE() AND (booking_id IN (SELECT id FROM bookings WHERE branch_id IN (${placeholders})) OR booking_id IS NULL)`,
                    [...turfIds]
                );
                todaysRev = Number(todayRevRes[0]?.total || 0);

                const [todayBookingsRes] = await db.query(
                    `SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURDATE() AND branch_id IN (${placeholders})`,
                    [...turfIds]
                );
                todaysBookings = Number(todayBookingsRes[0]?.count || 0);

                const [totalRevRes] = await db.query(
                    `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED'`
                );
                totalRev = Number(totalRevRes[0]?.total || 0);

                const [activeRes] = await db.query(
                    `SELECT COUNT(*) as count FROM slots WHERE status = 'BOOKED' AND slot_date = CURDATE() AND branch_id IN (${placeholders})`,
                    [...turfIds]
                );
                activeMatches = Number(activeRes[0]?.count || 0);

                const [availRes] = await db.query(
                    `SELECT COUNT(*) as count FROM slots WHERE status = 'AVAILABLE' AND slot_date = CURDATE() AND branch_id IN (${placeholders})`,
                    [...turfIds]
                );
                availableSlots = Number(availRes[0]?.count || 0);

                const [bookingsList] = await db.query(
                    `SELECT b.id, b.customer_name, b.sport_name, b.court_name, b.amount, b.status, b.created_at 
                     FROM bookings b 
                     WHERE b.branch_id IN (${placeholders}) 
                     ORDER BY b.created_at DESC LIMIT 5`,
                    [...turfIds]
                );

                recentBookings = bookingsList.map(b => ({
                    id: String(b.id),
                    time: new Date(b.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    customer: b.customer_name || 'Customer',
                    sport: b.sport_name || 'Football',
                    court: b.court_name || 'Court 1',
                    amount: `₹${Number(b.amount || 0).toLocaleString()}`,
                    status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'Confirmed' : 'Pending'
                }));
            }

            const [sportsRes] = await db.query(`SELECT COUNT(*) as count FROM sports`);
            const sportsCount = Number(sportsRes[0]?.count || 5);

            return res.status(200).json({
                success: true,
                data: {
                    todaysRevenue: todaysRev,
                    todaysBookings: todaysBookings,
                    activeMatches: activeMatches,
                    upcomingEvents: 0,
                    totalRevenue: totalRev,
                    availableSlots: availableSlots,
                    sportsCount,
                    recentBookings: recentBookings
                }
            });
        }

        // Super Admin Summary
        const [branchesRes] = await db.query(`SELECT COUNT(*) as count FROM branches`);
        const totalBranches = Number(branchesRes[0]?.count || 0);

        const [activeRes] = await db.query(`SELECT COUNT(*) as count FROM branches WHERE status = 'ACTIVE'`);
        const activeBranches = Number(activeRes[0]?.count || totalBranches);

        const [inactiveRes] = await db.query(`SELECT COUNT(*) as count FROM branches WHERE status != 'ACTIVE'`);
        const inactiveBranches = Number(inactiveRes[0]?.count || 0);

        const [paymentsRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'COMPLETED'`);
        const [bookingsRes] = await db.query(`SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status = 'CONFIRMED'`);
        const totalRevenue = Math.max(Number(paymentsRes[0]?.total || 0), Number(bookingsRes[0]?.total || 0));

        const [ownersRes] = await db.query(`SELECT COUNT(*) as count FROM owners`);
        const totalUsers = Number(ownersRes[0]?.count || 0);

        const [subsRes] = await db.query(`SELECT COUNT(*) as count FROM subscription_plans WHERE status = 'active'`);
        const activeSubscriptions = Number(subsRes[0]?.count || 0);

        return res.status(200).json({
            success: true,
            data: {
                totalBranches,
                activeBranches,
                inactiveBranches,
                totalRevenue,
                totalUsers,
                activeSubscriptions,
                monthlyGrowth: 14.8
            }
        });
    } catch (error) {
        console.error('Fetch dashboard summary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling dashboard summary: ' + error.message
        });
    }
};

/**
 * Get Monthly Revenue Growth Timeline
 */
const getRevenueGrowth = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as Month,
                SUM(amount) as Revenue
            FROM payments
            WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `);

        let formattedData = rows.map(r => ({
            Month: r.Month,
            Revenue: Number(r.Revenue || 0),
            month: r.Month,
            revenue: Number(r.Revenue || 0)
        }));

        return res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Revenue growth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling revenue growth: ' + error.message
        });
    }
};

/**
 * Get Monthly Commission Earnings Trend
 */
const getCommissionGrowth = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%b') as Month,
                ROUND(SUM(amount) * 0.12) as Commission
            FROM payments
            WHERE status = 'COMPLETED' AND created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY DATE_FORMAT(created_at, '%b'), MONTH(created_at)
            ORDER BY MONTH(created_at) ASC
        `);

        let formattedData = rows.map(r => ({
            Month: r.Month,
            'Commission Amount': Number(r.Commission || 0),
            month: r.Month,
            commission: Number(r.Commission || 0)
        }));

        return res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Commission growth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error compiling commission growth: ' + error.message
        });
    }
};

/**
 * Get Top Performing Branches / Turfs
 */
const getTopBranches = async (req, res) => {
    try {
        let rows = [];
        try {
            const [queryResult] = await db.query(`
                SELECT 
                    br.id as _id,
                    br.branch_name as 'Branch Name',
                    br.city as City,
                    COALESCE(SUM(b.amount), 0) as Revenue,
                    COUNT(b.id) as Bookings,
                    br.status as Status,
                    br.branch_name as branchName,
                    br.city as city,
                    COUNT(b.id) as bookingsCount,
                    COALESCE(SUM(b.amount), 0) as totalRevenue,
                    br.status as status
                FROM branches br
                LEFT JOIN bookings b ON b.branch_id = br.id
                GROUP BY br.id, br.branch_name, br.city, br.status
                ORDER BY totalRevenue DESC
                LIMIT 5
            `);
            rows = queryResult;
        } catch (dbErr) {
            console.warn('Top branches query note:', dbErr.message);
        }

        let formattedBranches = rows || [];

        return res.status(200).json({
            success: true,
            data: formattedBranches
        });
    } catch (error) {
        console.error('Top branches error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching top branches: ' + error.message
        });
    }
};

/**
 * Get Recent System Audit Activities (Real MySQL Data)
 */
const getRecentActivities = async (req, res) => {
    try {
        const activities = [];

        // 1. Fetch recent Admin/Owners created
        try {
            const [ownerRows] = await db.query(`
                SELECT 
                    id, 
                    full_name, 
                    business_name, 
                    created_at 
                FROM owners 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            ownerRows.forEach(o => {
                activities.push({
                    id: `owner_${o.id}`,
                    activity: 'Admin Created',
                    details: `${o.full_name || 'Admin'} registered ${o.business_name ? `(${o.business_name})` : 'account'}`,
                    timestamp: o.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Owner activities query note:', e.message);
        }

        // 2. Fetch recent Subscription Plans created/updated
        try {
            const [planRows] = await db.query(`
                SELECT 
                    id, 
                    plan_name, 
                    price, 
                    created_at 
                FROM subscription_plans 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            planRows.forEach(p => {
                activities.push({
                    id: `plan_${p.id}`,
                    activity: 'Subscription Plan Created',
                    details: `${p.plan_name} Plan active at ₹${Number(p.price || 0).toLocaleString('en-IN')}`,
                    timestamp: p.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Plan activities query note:', e.message);
        }

        // 3. Fetch recent Turfs created
        try {
            const [turfRows] = await db.query(`
                SELECT 
                    id, 
                    branch_name as name, 
                    city, 
                    created_at 
                FROM branches 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            turfRows.forEach(t => {
                activities.push({
                    id: `turf_${t.id}`,
                    activity: 'Turf Created',
                    details: `${t.name} venue established in ${t.city || 'India'}`,
                    timestamp: t.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Turf activities query note:', e.message);
        }

        // 4. Fetch recent Bookings logged
        try {
            const [bookingRows] = await db.query(`
                SELECT 
                    id, 
                    customer_name, 
                    amount, 
                    status, 
                    created_at 
                FROM bookings 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            bookingRows.forEach(b => {
                activities.push({
                    id: `booking_${b.id}`,
                    activity: 'Booking Logged',
                    details: `Booking #${b.id} for ₹${Number(b.amount || 0).toLocaleString('en-IN')} (${b.customer_name || 'Customer'})`,
                    timestamp: b.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Booking activities query note:', e.message);
        }

        // 5. Fetch recent Corporate Proposals
        try {
            const [corpRows] = await db.query(`
                SELECT 
                    id, 
                    company_name, 
                    contact_person,
                    event_type,
                    city, 
                    created_at 
                FROM corporate_bookings 
                ORDER BY created_at DESC 
                LIMIT 5
            `);
            corpRows.forEach(c => {
                activities.push({
                    id: `corp_${c.id}`,
                    activity: 'Admin Created',
                    details: `${c.contact_person || c.company_name} registered (${c.company_name})`,
                    timestamp: c.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Corporate proposal activities query note:', e.message);
        }

        // Sort combined list by timestamp DESC
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            success: true,
            data: activities.slice(0, 10)
        });
    } catch (error) {
        console.error('Recent activities error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching recent activities: ' + error.message
        });
    }
};

module.exports = {
    getDashboardSummary,
    getRevenueGrowth,
    getCommissionGrowth,
    getTopBranches,
    getRecentActivities
};
