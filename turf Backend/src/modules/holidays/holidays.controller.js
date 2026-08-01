const db = require('../../config/db');

/**
 * List holidays for a specific branch
 */
const getHolidays = async (req, res) => {
    const { branchId } = req.query;

    try {
        let sql = 'SELECT * FROM holidays';
        const params = [];

        if (branchId) {
            sql += ' WHERE branch_id = ?';
            params.push(branchId);
        }

        sql += ' ORDER BY holiday_date ASC';

        const [rows] = await db.query(sql, params);

        const formatted = rows.map(r => {
            let holidayDateStr = '';
            if (r.holiday_date) {
                const d = new Date(r.holiday_date);
                holidayDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }

            return {
                id: r.id,
                _id: r.id,
                branchId: r.branch_id,
                title: r.title,
                holidayDate: holidayDateStr,
                startDate: holidayDateStr,
                endDate: holidayDateStr,
                reason: r.reason,
                isFullDay: !!r.is_full_day
            };
        });

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch holidays error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching holidays list.'
        });
    }
};

/**
 * Create a new calendar block / holiday
 */
const createHoliday = async (req, res) => {
    const { branchId, title, holidayDate, reason, isFullDay } = req.body;

    if (!branchId || !title || !holidayDate) {
        return res.status(400).json({
            success: false,
            message: 'branchId, title, and holidayDate are required fields.'
        });
    }

    try {
        const holidayId = 'hol_' + Date.now();
        const fullDay = isFullDay ? 1 : 0;

        await db.query(`
            INSERT INTO holidays (id, branch_id, title, holiday_date, reason, is_full_day)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            holidayId,
            branchId,
            title,
            holidayDate,
            reason || '',
            fullDay
        ]);

        return res.status(201).json({
            success: true,
            message: 'Holiday registered successfully.',
            data: {
                id: holidayId,
                title,
                holidayDate
            }
        });
    } catch (error) {
        console.error('Create holiday error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error registering holiday.'
        });
    }
};

/**
 * Delete a holiday block
 */
const deleteHoliday = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM holidays WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Holiday block not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Holiday block deleted successfully.'
        });
    } catch (error) {
        console.error('Delete holiday error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting holiday.'
        });
    }
};

module.exports = {
    getHolidays,
    createHoliday,
    deleteHoliday
};
