/**
 * SlotHoldService
 * Manages temporary 5-minute slot holds in `slot_holds` table with database
 * transaction locks to prevent double-booking race conditions.
 */

const pool = require('../config/db');

class SlotHoldService {
    /**
     * Creates a temporary 5-minute slot hold for a turf, date, and start/end time.
     */
    static async createHold({ turfId, slotDate, startTime, endTime, matchId, durationMinutes = 5 }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check if there is an active hold or confirmed booking for this slot
            const [existingHolds] = await connection.query(
                `SELECT id, expires_at FROM slot_holds 
                 WHERE turf_id = ? AND slot_date = ? AND start_time = ? AND status = 'ACTIVE' AND expires_at > NOW()
                 FOR UPDATE`,
                [turfId, slotDate, startTime]
            );

            if (existingHolds && existingHolds.length > 0) {
                await connection.rollback();
                return { success: false, reason: 'SLOT_HELD_BY_ANOTHER_USER', holdId: existingHolds[0].id };
            }

            // 2. Insert new temporary slot hold
            const holdId = `HOLD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

            await connection.query(
                `INSERT INTO slot_holds (id, turf_id, slot_date, start_time, end_time, match_id, expires_at, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [holdId, turfId, slotDate, startTime, endTime, matchId, expiresAt]
            );

            await connection.commit();
            return { success: true, holdId, expiresAt };
        } catch (error) {
            await connection.rollback();
            console.error('[SlotHoldService] Error creating hold:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Converts a temporary slot hold to CONVERTED upon successful payment.
     */
    static async convertHold(holdId) {
        try {
            await pool.query(
                `UPDATE slot_holds SET status = 'CONVERTED' WHERE id = ?`,
                [holdId]
            );
            return true;
        } catch (error) {
            console.error('[SlotHoldService] Error converting hold:', error);
            return false;
        }
    }

    /**
     * Releases a temporary slot hold (sets status to RELEASED).
     */
    static async releaseHold(holdId) {
        try {
            await pool.query(
                `UPDATE slot_holds SET status = 'RELEASED' WHERE id = ?`,
                [holdId]
            );
            return true;
        } catch (error) {
            console.error('[SlotHoldService] Error releasing hold:', error);
            return false;
        }
    }

    /**
     * Background cleaner for expired slot holds.
     */
    static async expireStaleHolds() {
        try {
            const [tables] = await pool.query("SHOW TABLES LIKE 'slot_holds'");
            if (!tables || tables.length === 0) return 0;

            const [cols] = await pool.query("SHOW COLUMNS FROM slot_holds LIKE 'status'");
            if (!cols || cols.length === 0) return 0;

            const [result] = await pool.query(
                `UPDATE slot_holds SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= NOW()`
            );
            return result.affectedRows || 0;
        } catch (error) {
            console.warn('[SlotHoldService] Expiry task note:', error.message);
            return 0;
        }
    }
}

module.exports = SlotHoldService;
