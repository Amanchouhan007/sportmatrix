const db = require('../../config/db');

/**
 * Get all global master sports
 */
const getMasterSports = async (req, res) => {
    try {
        const [sports] = await db.query('SELECT * FROM sports');
        return res.status(200).json({
            success: true,
            data: sports
        });
    } catch (error) {
        console.error('Fetch master sports error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching master sports.'
        });
    }
};

/**
 * Get all configured sports for a specific branch
 */
const getBranchSports = async (req, res) => {
    const { branchId } = req.params;

    if (!branchId) {
        return res.status(400).json({
            success: false,
            message: 'branchId path parameter is required.'
        });
    }

    try {
        const [rows] = await db.query(`
            SELECT 
                bs.id,
                bs.branch_id,
                bs.sport_id,
                bs.regular_price,
                bs.peak_price,
                bs.total_courts,
                bs.opening_time,
                bs.closing_time,
                bs.slot_duration,
                bs.status,
                s.name as sport_name,
                s.icon as sport_icon,
                s.category as sport_category
            FROM branch_sports bs
            JOIN sports s ON bs.sport_id = s.id
            WHERE bs.branch_id = ?
        `, [branchId]);

        // Map database columns to exact frontend UI expected fields
        const formattedSports = rows.map(r => ({
            id: r.id,
            _id: r.id, // compatibility
            branchId: r.branch_id,
            sportId: {
                id: r.sport_id,
                _id: r.sport_id,
                name: r.sport_name,
                icon: r.sport_icon,
                category: r.sport_category
            },
            name: r.sport_name,
            icon: r.sport_icon,
            price: r.regular_price,
            regularPrice: r.regular_price,
            peakPrice: r.peak_price,
            courts: r.total_courts,
            totalCourts: r.total_courts,
            openingTime: r.opening_time ? r.opening_time.substring(0, 5) : '06:00', // HH:MM
            closingTime: r.closing_time ? r.closing_time.substring(0, 5) : '22:00',
            slotDuration: r.slot_duration,
            status: r.status
        }));

        return res.status(200).json({
            success: true,
            data: formattedSports
        });
    } catch (error) {
        console.error('Fetch branch sports error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching branch sports.'
        });
    }
};

/**
 * Configure/activate a sport for a branch
 */
const activateBranchSport = async (req, res) => {
    const {
        branchId,
        sportId,
        regularPrice,
        peakPrice,
        totalCourts,
        openingTime,
        closingTime,
        slotDuration
    } = req.body;

    if (!branchId || !sportId) {
        return res.status(400).json({
            success: false,
            message: 'branchId and sportId are required.'
        });
    }

    try {
        // 1. Verify master sport exists
        const [sports] = await db.query('SELECT * FROM sports WHERE id = ?', [sportId]);
        if (sports.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Master sport not found.'
            });
        }
        const sport = sports[0];

        // 2. Check if already activated in branch
        const [existing] = await db.query('SELECT id FROM branch_sports WHERE branch_id = ? AND sport_id = ?', [branchId, sportId]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'This sport is already active for this branch.'
            });
        }

        // 3. Save Configuration
        const branchSportId = 'bs_' + Date.now();
        await db.query(`
            INSERT INTO branch_sports (
                id, branch_id, sport_id, regular_price, peak_price, total_courts, opening_time, closing_time, slot_duration, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            branchSportId,
            branchId,
            sportId,
            regularPrice || 1000,
            peakPrice || 1500,
            totalCourts || 1,
            openingTime || '06:00:00',
            closingTime || '22:00:00',
            slotDuration || 60
        ]);

        const newSport = {
            id: branchSportId,
            _id: branchSportId,
            branchId,
            sportId: {
                id: sport.id,
                _id: sport.id,
                name: sport.name,
                icon: sport.icon
            },
            name: sport.name,
            icon: sport.icon,
            price: regularPrice || 1000,
            regularPrice: regularPrice || 1000,
            peakPrice: peakPrice || 1500,
            courts: totalCourts || 1,
            totalCourts: totalCourts || 1,
            openingTime: openingTime || '06:00',
            closingTime: closingTime || '22:00',
            slotDuration: slotDuration || 60,
            status: 'ACTIVE'
        };

        return res.status(201).json({
            success: true,
            data: newSport,
            message: 'Sport activated successfully'
        });
    } catch (error) {
        console.error('Activate branch sport error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error activating branch sport.'
        });
    }
};

/**
 * Update a branch sport configuration
 */
const updateBranchSport = async (req, res) => {
    const { id } = req.params;
    const {
        regularPrice,
        peakPrice,
        totalCourts,
        openingTime,
        closingTime,
        slotDuration
    } = req.body;

    try {
        // 1. Verify existence
        const [existing] = await db.query('SELECT * FROM branch_sports WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch sport configuration not found.'
            });
        }

        // 2. Update record
        await db.query(`
            UPDATE branch_sports 
            SET 
                regular_price = COALESCE(?, regular_price),
                peak_price = COALESCE(?, peak_price),
                total_courts = COALESCE(?, total_courts),
                opening_time = COALESCE(?, opening_time),
                closing_time = COALESCE(?, closing_time),
                slot_duration = COALESCE(?, slot_duration)
            WHERE id = ?
        `, [
            regularPrice,
            peakPrice,
            totalCourts,
            openingTime,
            closingTime,
            slotDuration,
            id
        ]);

        // 3. Return updated details
        const [updatedRows] = await db.query(`
            SELECT bs.*, s.name, s.icon FROM branch_sports bs
            JOIN sports s ON bs.sport_id = s.id
            WHERE bs.id = ?
        `, [id]);
        const r = updatedRows[0];

        const updatedSport = {
            id: r.id,
            _id: r.id,
            branchId: r.branch_id,
            sportId: {
                id: r.sport_id,
                _id: r.sport_id,
                name: r.name,
                icon: r.icon
            },
            name: r.name,
            icon: r.icon,
            price: r.regular_price,
            regularPrice: r.regular_price,
            peakPrice: r.peak_price,
            courts: r.total_courts,
            totalCourts: r.total_courts,
            openingTime: r.opening_time ? r.opening_time.substring(0, 5) : '06:00',
            closingTime: r.closing_time ? r.closing_time.substring(0, 5) : '22:00',
            slotDuration: r.slot_duration,
            status: r.status
        };

        return res.status(200).json({
            success: true,
            data: updatedSport,
            message: 'Sport updated successfully'
        });
    } catch (error) {
        console.error('Update branch sport error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating branch sport.'
        });
    }
};

/**
 * Toggle branch sport availability status
 */
const changeSportStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status field must be either ACTIVE or INACTIVE.'
        });
    }

    try {
        const [result] = await db.query('UPDATE branch_sports SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch sport configuration not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Status updated to ${status}`
        });
    } catch (error) {
        console.error('Toggle status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating status.'
        });
    }
};

/**
 * Remove a sport configuration from a branch
 */
const deleteBranchSport = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM branch_sports WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch sport configuration not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Sport removed successfully'
        });
    } catch (error) {
        console.error('Delete branch sport error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting branch sport.'
        });
    }
};

/**
 * Handle upload image logic
 */
const uploadSportImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload an image file.'
        });
    }

    // Build the public HTTP URL for the uploaded image
    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully.',
        url: fileUrl,
        filename: req.file.filename
    });
};

module.exports = {
    getMasterSports,
    getBranchSports,
    activateBranchSport,
    updateBranchSport,
    changeSportStatus,
    deleteBranchSport,
    uploadSportImage
};
