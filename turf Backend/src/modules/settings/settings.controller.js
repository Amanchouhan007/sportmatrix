const db = require('../../config/db');

/**
 * Get global commission settings
 */
const getCommissionSettings = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM system_settings WHERE id = 'global_commission'`);
        if (rows.length > 0) {
            const row = rows[0];
            let sportsRates = [];
            try {
                sportsRates = typeof row.sports_rates === 'string' ? JSON.parse(row.sports_rates) : row.sports_rates;
            } catch (e) {
                sportsRates = [
                    { sportName: 'Football', commissionRate: 5.0 },
                    { sportName: 'Cricket', commissionRate: 5.0 },
                    { sportName: 'Badminton', commissionRate: 4.0 },
                    { sportName: 'Tennis', commissionRate: 4.5 }
                ];
            }

            return res.status(200).json({
                success: true,
                data: {
                    defaultRate: row.default_rate || 5.0,
                    maxRate: row.max_rate || 15.0,
                    status: row.status || 'ACTIVE',
                    sportsRates
                }
            });
        }

        // Return default fallback if row missing
        return res.status(200).json({
            success: true,
            data: {
                defaultRate: 5.0,
                maxRate: 15.0,
                status: 'ACTIVE',
                sportsRates: [
                    { sportName: 'Football', commissionRate: 5.0 },
                    { sportName: 'Cricket', commissionRate: 5.0 },
                    { sportName: 'Badminton', commissionRate: 4.0 },
                    { sportName: 'Tennis', commissionRate: 4.5 }
                ]
            }
        });
    } catch (error) {
        console.error('Fetch commission settings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching commission settings: ' + error.message
        });
    }
};

/**
 * Update global commission settings
 */
const updateCommissionSettings = async (req, res) => {
    const { defaultRate, maxRate, sportsRates } = req.body;

    const defRate = Number(defaultRate);
    const mRate = Number(maxRate);

    if (isNaN(defRate) || defRate < 0 || defRate > 100) {
        return res.status(400).json({ success: false, message: 'Default Rate must be between 0 and 100.' });
    }
    if (isNaN(mRate) || mRate < 0 || mRate > 100) {
        return res.status(400).json({ success: false, message: 'Max Rate must be between 0 and 100.' });
    }

    try {
        const jsonSports = JSON.stringify(sportsRates || []);

        await db.query(`
            INSERT INTO system_settings (id, default_rate, max_rate, status, sports_rates)
            VALUES ('global_commission', ?, ?, 'ACTIVE', ?)
            ON DUPLICATE KEY UPDATE
                default_rate = VALUES(default_rate),
                max_rate = VALUES(max_rate),
                sports_rates = VALUES(sports_rates)
        `, [defRate, mRate, jsonSports]);

        return res.status(200).json({
            success: true,
            message: 'Commission settings updated successfully',
            data: {
                defaultRate: defRate,
                maxRate: mRate,
                status: 'ACTIVE',
                sportsRates
            }
        });
    } catch (error) {
        console.error('Update commission settings error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating commission settings: ' + error.message
        });
    }
};

module.exports = {
    getCommissionSettings,
    updateCommissionSettings
};
