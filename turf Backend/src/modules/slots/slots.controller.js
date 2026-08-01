const db = require('../../config/db');

/**
 * Fetch slots based on query parameters (branchId, date, sportId, courtName)
 */
const getSlots = async (req, res) => {
    const { branchId, date, sportId, courtName } = req.query;

    try {
        let sql = `
            SELECT 
                sl.*,
                s.name as sport_name,
                s.icon as sport_icon
            FROM slots sl
            LEFT JOIN sports s ON sl.sport_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (branchId) {
            sql += ' AND sl.branch_id = ?';
            params.push(branchId);
        }
        if (date) {
            sql += ' AND sl.slot_date = ?';
            params.push(date);
        }
        if (sportId) {
            sql += ' AND sl.sport_id = ?';
            params.push(sportId);
        }
        if (courtName) {
            sql += ' AND sl.court_name = ?';
            params.push(courtName);
        }

        sql += ' ORDER BY sl.slot_date ASC, sl.start_time ASC';

        const [rows] = await db.query(sql, params);

        // Format dates and times to match expected frontend interface formats
        const formattedSlots = rows.map(r => {
            // Format slotDate to YYYY-MM-DD
            let slotDateStr = '';
            if (r.slot_date) {
                const d = new Date(r.slot_date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                slotDateStr = `${year}-${month}-${day}`;
            }

            return {
                id: r.id,
                _id: r.id, // compatibility
                branchId: r.branch_id,
                sportId: r.sport_id ? {
                    id: r.sport_id,
                    _id: r.sport_id,
                    name: r.sport_name,
                    icon: r.sport_icon
                } : null,
                courtName: r.court_name,
                date: slotDateStr,
                slotDate: slotDateStr,
                startTime: r.start_time ? r.start_time.substring(0, 5) : '', // HH:MM
                endTime: r.end_time ? r.end_time.substring(0, 5) : '',     // HH:MM
                duration: r.duration,
                regularPrice: r.regular_price,
                price: r.is_peak_hour ? r.peak_price : r.regular_price, // current effective price
                peakPrice: r.peak_price,
                isPeakHour: !!r.is_peak_hour,
                status: r.status,
                notes: r.notes || ''
            };
        });

        return res.status(200).json({
            success: true,
            data: formattedSlots
        });
    } catch (error) {
        console.error('Fetch slots error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching slots.'
        });
    }
};

/**
 * Get slot by ID
 */
const getSlotById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`
            SELECT sl.*, s.name as sport_name, s.icon as sport_icon 
            FROM slots sl
            LEFT JOIN sports s ON sl.sport_id = s.id
            WHERE sl.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found.'
            });
        }

        const r = rows[0];
        let slotDateStr = '';
        if (r.slot_date) {
            const d = new Date(r.slot_date);
            slotDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        const formattedSlot = {
            id: r.id,
            _id: r.id,
            branchId: r.branch_id,
            sportId: r.sport_id ? {
                id: r.sport_id,
                _id: r.sport_id,
                name: r.sport_name,
                icon: r.sport_icon
            } : null,
            courtName: r.court_name,
            date: slotDateStr,
            slotDate: slotDateStr,
            startTime: r.start_time ? r.start_time.substring(0, 5) : '',
            endTime: r.end_time ? r.end_time.substring(0, 5) : '',
            duration: r.duration,
            regularPrice: r.regular_price,
            price: r.is_peak_hour ? r.peak_price : r.regular_price,
            peakPrice: r.peak_price,
            isPeakHour: !!r.is_peak_hour,
            status: r.status,
            notes: r.notes || ''
        };

        return res.status(200).json({
            success: true,
            data: formattedSlot
        });
    } catch (error) {
        console.error('Fetch slot by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching slot.'
        });
    }
};

/**
 * Create a new custom slot
 */
const createSlot = async (req, res) => {
    const {
        branchId,
        sportId,
        courtName,
        slotDate,
        startTime,
        endTime,
        duration,
        regularPrice,
        peakPrice,
        isPeakHour
    } = req.body;

    if (!branchId || !sportId || !courtName || !slotDate || !startTime || !endTime) {
        return res.status(400).json({
            success: false,
            message: 'branchId, sportId, courtName, slotDate, startTime, and endTime are required fields.'
        });
    }

    try {
        const slotId = 'slot_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const peakHour = isPeakHour ? 1 : 0;

        await db.query(`
            INSERT INTO slots (
                id, branch_id, sport_id, court_name, slot_date, start_time, end_time, duration, regular_price, peak_price, is_peak_hour, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', '')
        `, [
            slotId,
            branchId,
            sportId,
            courtName,
            slotDate,
            startTime,
            endTime,
            duration || 60,
            regularPrice || 0,
            peakPrice || 0,
            peakHour
        ]);

        return res.status(201).json({
            success: true,
            message: 'Slot created successfully',
            data: {
                id: slotId,
                _id: slotId,
                branchId,
                sportId,
                courtName,
                date: slotDate,
                startTime,
                endTime,
                status: 'AVAILABLE'
            }
        });
    } catch (error) {
        console.error('Create slot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error creating slot.'
        });
    }
};

/**
 * Update slot price or court details
 */
const updateSlot = async (req, res) => {
    const { id } = req.params;
    const { regularPrice, peakPrice, courtName } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM slots WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Slot configuration not found.'
            });
        }

        await db.query(`
            UPDATE slots 
            SET 
                regular_price = COALESCE(?, regular_price),
                peak_price = COALESCE(?, peak_price),
                court_name = COALESCE(?, court_name)
            WHERE id = ?
        `, [regularPrice, peakPrice, courtName, id]);

        return res.status(200).json({
            success: true,
            message: 'Slot updated successfully'
        });
    } catch (error) {
        console.error('Update slot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating slot.'
        });
    }
};

/**
 * Update slot status (AVAILABLE, BOOKED, BLOCKED, COMPLETED)
 */
const updateSlotStatus = async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['AVAILABLE', 'BOOKED', 'BLOCKED', 'COMPLETED'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status must be one of: AVAILABLE, BOOKED, BLOCKED, COMPLETED.'
        });
    }

    try {
        const [result] = await db.query('UPDATE slots SET status = ?, notes = ? WHERE id = ?', [status, notes || '', id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Slot configuration not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Slot status updated to ${status}`
        });
    } catch (error) {
        console.error('Update slot status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating status.'
        });
    }
};

/**
 * Delete a slot
 */
const deleteSlot = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM slots WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Slot configuration not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Slot deleted successfully'
        });
    } catch (error) {
        console.error('Delete slot error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting slot.'
        });
    }
};

module.exports = {
    getSlots,
    getSlotById,
    createSlot,
    updateSlot,
    updateSlotStatus,
    deleteSlot
};
