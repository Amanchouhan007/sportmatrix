const db = require('../../config/db');

/**
 * Get unified dashboard summary calculations (reuse existing databases)
 */
const getDashboardSummary = async (req, res) => {
    const { branchId } = req.query;

    try {
        // 1. Today's Bookings SQL
        let bookingsSql = `
            SELECT COUNT(b.id) as count 
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            WHERE b.status = 'CONFIRMED' AND sl.slot_date = CURDATE()
        `;
        const bookingsParams = [];
        if (branchId) {
            bookingsSql += ' AND sl.branch_id = ?';
            bookingsParams.push(branchId);
        }

        // 2. Today's Revenue SQL
        let revenueSql = `
            SELECT COALESCE(SUM(p.amount), 0) as total 
            FROM payments p
        `;
        const revenueParams = [];
        if (branchId) {
            revenueSql += `
                JOIN bookings b ON p.booking_id = b.id
                JOIN slots sl ON b.slot_id = sl.id
                WHERE p.status = 'COMPLETED' AND DATE(p.created_at) = CURDATE() AND sl.branch_id = ?
            `;
            revenueParams.push(branchId);
        } else {
            revenueSql += " WHERE p.status = 'COMPLETED' AND DATE(p.created_at) = CURDATE()";
        }

        // 3. Available Slots (For today) SQL
        let slotsSql = "SELECT COUNT(*) as count FROM slots WHERE status = 'AVAILABLE' AND slot_date = CURDATE()";
        const slotsParams = [];
        if (branchId) {
            slotsSql += ' AND branch_id = ?';
            slotsParams.push(branchId);
        }

        // 4. Sports Count SQL
        let sportsSql = "SELECT COUNT(*) as count FROM branch_sports WHERE status = 'ACTIVE'";
        const sportsParams = [];
        if (branchId) {
            sportsSql += ' AND branch_id = ?';
            sportsParams.push(branchId);
        }

        // 5. Tournament Count SQL
        let tournamentsSql = "SELECT COUNT(*) as count FROM tournaments WHERE status IN ('Upcoming', 'Active')";
        const tournamentsParams = [];
        if (branchId) {
            tournamentsSql += ' AND branch_id = ?';
            tournamentsParams.push(branchId);
        }

        // 6. Inventory Alert count SQL
        let inventorySql = "SELECT COUNT(*) as count FROM inventory WHERE stock_quantity < min_stock_alert";
        const inventoryParams = [];
        if (branchId) {
            inventorySql += ' AND branch_id = ?';
            inventoryParams.push(branchId);
        }

        // Run all queries concurrently
        const [
            [bookingsRes],
            [revenueRes],
            [slotsRes],
            [sportsRes],
            [tournamentsRes],
            [inventoryRes]
        ] = await Promise.all([
            db.query(bookingsSql, bookingsParams),
            db.query(revenueSql, revenueParams),
            db.query(slotsSql, slotsParams),
            db.query(sportsSql, sportsParams),
            db.query(tournamentsSql, tournamentsParams),
            db.query(inventorySql, inventoryParams)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                todaysBookings: bookingsRes[0].count,
                todaysRevenue: revenueRes[0].total,
                availableSlots: slotsRes[0].count,
                sportsCount: sportsRes[0].count,
                tournamentCount: tournamentsRes[0].count,
                inventoryAlerts: inventoryRes[0].count
            }
        });
    } catch (error) {
        console.error('Fetch dashboard summary error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling dashboard summary metrics.'
        });
    }
};

module.exports = {
    getDashboardSummary
};
