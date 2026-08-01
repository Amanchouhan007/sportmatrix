const db = require('../../config/db');

/**
 * Create a new slot booking (Transactional)
 */
const createBooking = async (req, res) => {
    const { slotId, customerName, mobileNumber, notes, userId } = req.body;

    if (!slotId || !customerName || !mobileNumber) {
        return res.status(400).json({
            success: false,
            message: 'slotId, customerName, and mobileNumber are required fields.'
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lock and retrieve slot details
        const [slots] = await connection.query(
            'SELECT * FROM slots WHERE id = ? FOR UPDATE',
            [slotId]
        );

        if (slots.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Target slot configuration not found.'
            });
        }

        const slot = slots[0];

        if (slot.status !== 'AVAILABLE') {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: `This slot is no longer available (current status: ${slot.status}).`
            });
        }

        // Calculate amount based on peak time indicator
        const amount = slot.is_peak_hour ? slot.peak_price : slot.regular_price;

        // Stringify details to match frontend slot notes expectations
        const bookingNotes = JSON.stringify({
            customerName: customerName.trim(),
            mobileNumber: mobileNumber.trim(),
            notes: (notes || '').trim()
        });

        // 2. Insert into bookings table
        const bookingUserId = userId || (req.user ? req.user.id : null);
        const [insertResult] = await connection.query(
            `INSERT INTO bookings (slot_id, user_id, customer_name, mobile_number, amount, duration, notes, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
            [slotId, bookingUserId, customerName.trim(), mobileNumber.trim(), amount, slot.duration, (notes || '').trim()]
        );

        const bookingId = insertResult.insertId;

        // 3. Update slot status and copy booking details
        await connection.query(
            'UPDATE slots SET status = "BOOKED", notes = ? WHERE id = ?',
            [bookingNotes, slotId]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: 'Booking successfully registered',
            data: {
                bookingId,
                slotId,
                amount,
                duration: slot.duration,
                customerName,
                mobileNumber
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create booking transaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error placing booking.'
        });
    } finally {
        connection.release();
    }
};

/**
 * Cancel an active booking (Transactional)
 */
const cancelBooking = async (req, res) => {
    const { id } = req.params; // Booking ID

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lock and fetch booking record
        const [bookings] = await connection.query(
            'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
            [id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Booking record not found.'
            });
        }

        const booking = bookings[0];

        if (booking.status === 'CANCELLED') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'This booking is already cancelled.'
            });
        }

        // 2. Set booking status to CANCELLED
        await connection.query(
            'UPDATE bookings SET status = "CANCELLED" WHERE id = ?',
            [id]
        );

        // 3. Unlock slot back to AVAILABLE
        await connection.query(
            'UPDATE slots SET status = "AVAILABLE", notes = "" WHERE id = ?',
            [booking.slot_id]
        );

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: 'Booking successfully cancelled, slot is now available.'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Cancel booking transaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error cancelling booking.'
        });
    } finally {
        connection.release();
    }
};

/**
 * Get upcoming bookings (Scheduled for today or future dates)
 */
const getUpcomingBookings = async (req, res) => {
    const { branchId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    try {
        let sql = `
            SELECT 
                b.id as booking_id,
                b.customer_name,
                b.mobile_number,
                b.amount,
                b.duration,
                b.notes as booking_notes,
                b.status as booking_status,
                b.created_at as booked_on,
                sl.slot_date,
                sl.start_time,
                sl.end_time,
                sl.court_name,
                s.name as sport_name,
                s.icon as sport_icon
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            JOIN sports s ON sl.sport_id = s.id
            WHERE b.status = 'CONFIRMED' AND sl.slot_date >= CURDATE()
        `;
        const params = [];

        // Apply filters based on roles
        if (userRole === 'CUSTOMER') {
            sql += ' AND b.user_id = ?';
            params.push(userId);
        } else {
            // Owner/Staff must specify active branch
            if (branchId) {
                sql += ' AND sl.branch_id = ?';
                params.push(branchId);
            }
        }

        sql += ' ORDER BY sl.slot_date ASC, sl.start_time ASC';

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch upcoming bookings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching upcoming bookings.'
        });
    }
};

/**
 * Get full booking ledger history
 */
const getBookingHistory = async (req, res) => {
    const { branchId } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    try {
        let sql = `
            SELECT 
                b.id as booking_id,
                b.customer_name,
                b.mobile_number,
                b.amount,
                b.duration,
                b.notes as booking_notes,
                b.status as booking_status,
                b.created_at as booked_on,
                sl.slot_date,
                sl.start_time,
                sl.end_time,
                sl.court_name,
                s.name as sport_name,
                s.icon as sport_icon
            FROM bookings b
            JOIN slots sl ON b.slot_id = sl.id
            JOIN sports s ON sl.sport_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole === 'CUSTOMER') {
            sql += ' AND b.user_id = ?';
            params.push(userId);
        } else {
            if (branchId) {
                sql += ' AND sl.branch_id = ?';
                params.push(branchId);
            }
        }

        sql += ' ORDER BY sl.slot_date DESC, sl.start_time DESC';

        const [rows] = await db.query(sql, params);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Fetch booking history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching booking history.'
        });
    }
};

module.exports = {
    createBooking,
    cancelBooking,
    getUpcomingBookings,
    getBookingHistory
};
