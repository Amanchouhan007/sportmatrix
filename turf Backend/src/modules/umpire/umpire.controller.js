const db = require('../../config/db');

/**
 * Get Umpire Profile
 */
const getUmpireProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId || 'ump_default';
        const [rows] = await db.query('SELECT * FROM umpire_profiles WHERE user_id = ? OR id = ? LIMIT 1', [userId, userId]);
        
        if (rows && rows.length > 0) {
            return res.status(200).json({ success: true, data: rows[0] });
        }

        // Return empty or default record
        return res.status(200).json({
            success: true,
            data: {
                id: 'ump_default',
                full_name: req.user?.name || 'Certified Umpire',
                license_no: 'UMP-IND-409',
                certification_level: 'Level-2 Turf Certified',
                officiating_grounds: 'Spike Turf & Royal Ground (Indore)',
                upi_id: 'rajesh.umpire@okhdfcbank',
                qr_mode: 'upi',
                custom_qr_image: null,
                on_duty_status: true,
                match_fee: 300
            }
        });
    } catch (error) {
        console.error('Error fetching umpire profile:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Umpire Profile / QR Config
 */
const updateUmpireProfile = async (req, res) => {
    try {
        const userId = req.user?.id || 'ump_default';
        const { full_name, upi_id, qr_mode, custom_qr_image, on_duty_status } = req.body;

        const [existing] = await db.query('SELECT id FROM umpire_profiles WHERE user_id = ? OR id = ?', [userId, userId]);
        
        if (existing && existing.length > 0) {
            await db.query(`
                UPDATE umpire_profiles
                SET full_name = COALESCE(?, full_name),
                    upi_id = COALESCE(?, upi_id),
                    qr_mode = COALESCE(?, qr_mode),
                    custom_qr_image = COALESCE(?, custom_qr_image),
                    on_duty_status = COALESCE(?, on_duty_status)
                WHERE id = ?
            `, [full_name, upi_id, qr_mode, custom_qr_image, on_duty_status, existing[0].id]);
        } else {
            await db.query(`
                INSERT INTO umpire_profiles (id, user_id, full_name, upi_id, qr_mode, custom_qr_image, on_duty_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ['ump_' + Date.now(), userId, full_name || 'Certified Umpire', upi_id || 'rajesh.umpire@okhdfcbank', qr_mode || 'upi', custom_qr_image || null, on_duty_status !== false]);
        }

        return res.status(200).json({ success: true, message: 'Umpire profile updated successfully' });
    } catch (error) {
        console.error('Error updating umpire profile:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Umpire Assigned Matches & Match History
 */
const getUmpireMatches = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM umpire_matches ORDER BY created_at DESC');
        return res.status(200).json({ success: true, data: rows || [] });
    } catch (error) {
        console.error('Error fetching umpire matches:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Match Score / Ball / Runs / Wickets
 */
const updateMatchScore = async (req, res) => {
    try {
        const { matchId, team1Score, team1Wickets, team1Overs, team2Score, team2Wickets, team2Overs, currentInnings, target, matchStatus } = req.body;
        
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        await db.query(`
            UPDATE umpire_matches
            SET team1_score = COALESCE(?, team1_score),
                team1_wickets = COALESCE(?, team1_wickets),
                team1_overs = COALESCE(?, team1_overs),
                team2_score = COALESCE(?, team2_score),
                team2_wickets = COALESCE(?, team2_wickets),
                team2_overs = COALESCE(?, team2_overs),
                current_innings = COALESCE(?, current_innings),
                target = COALESCE(?, target),
                match_status = COALESCE(?, match_status)
            WHERE id = ? OR match_code = ?
        `, [team1Score, team1Wickets, team1Overs, team2Score, team2Wickets, team2Overs, currentInnings, target, matchStatus, matchId, matchId]);

        return res.status(200).json({ success: true, message: 'Match score updated successfully' });
    } catch (error) {
        console.error('Error updating match score:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Conduct Toss
 */
const recordToss = async (req, res) => {
    try {
        const { matchId, tossWinner, tossDecision } = req.body;
        if (!matchId || !tossWinner || !tossDecision) {
            return res.status(400).json({ success: false, message: 'matchId, tossWinner and tossDecision are required' });
        }

        await db.query(`
            UPDATE umpire_matches
            SET toss_winner = ?,
                toss_decision = ?,
                match_status = 'LIVE'
            WHERE id = ? OR match_code = ?
        `, [tossWinner, tossDecision, matchId, matchId]);

        return res.status(200).json({ success: true, message: 'Toss recorded successfully' });
    } catch (error) {
        console.error('Error recording toss:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Complete Match & Official Sign-off
 */
const completeMatch = async (req, res) => {
    try {
        const { matchId, winnerName } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        await db.query(`
            UPDATE umpire_matches
            SET match_status = 'COMPLETED',
                winner_name = ?,
                officiated_at = CURRENT_TIMESTAMP
            WHERE id = ? OR match_code = ?
        `, [winnerName || 'Winner Declared', matchId, matchId]);

        return res.status(200).json({ success: true, message: 'Match completed and certified successfully' });
    } catch (error) {
        console.error('Error completing match:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark Payment Status
 */
const updatePaymentStatus = async (req, res) => {
    try {
        const { matchId, paymentStatus, receiptNo } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        const generatedReceipt = receiptNo || `REC-UMP-${Date.now()}`;

        await db.query(`
            UPDATE umpire_matches
            SET payment_status = ?,
                receipt_no = ?
            WHERE id = ? OR match_code = ?
        `, [paymentStatus || 'RECEIVED', generatedReceipt, matchId, matchId]);

        return res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            receiptNo: generatedReceipt
        });
    } catch (error) {
        console.error('Error updating payment status:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Register Ground Match
 */
const registerGroundMatch = async (req, res) => {
    try {
        const { team1Name, team1Captain, team1Phone, team2Name, team2Captain, team2Phone, venue, scheduledTime, dutyFee, matchType } = req.body;

        if (!team1Name || !team2Name || !venue) {
            return res.status(400).json({ success: false, message: 'team1Name, team2Name, and venue are required fields' });
        }

        const matchId = `match_${Date.now()}`;
        const matchCode = `MTC-IND-${Math.floor(100 + Math.random() * 900)}`;

        await db.query(`
            INSERT INTO umpire_matches (
                id, match_code, match_title, match_type, venue, scheduled_time, duty_fee,
                team1_name, team1_captain, team1_phone, team2_name, team2_captain, team2_phone, match_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING')
        `, [
            matchId, matchCode, `${team1Name} vs ${team2Name}`, matchType || 'DARE MATCH',
            venue, scheduledTime || 'Today', dutyFee || 300,
            team1Name, team1Captain || 'Captain 1', team1Phone || '',
            team2Name, team2Captain || 'Captain 2', team2Phone || ''
        ]);

        return res.status(201).json({
            success: true,
            message: 'Ground match registered successfully',
            data: { id: matchId, matchCode }
        });
    } catch (error) {
        console.error('Error registering ground match:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUmpireProfile,
    updateUmpireProfile,
    getUmpireMatches,
    updateMatchScore,
    recordToss,
    completeMatch,
    updatePaymentStatus,
    registerGroundMatch
};
