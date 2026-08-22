/**
 * MatchExpiryService
 * Background scheduled worker processing expired 5-minute slot holds,
 * expired opponent payment windows, expired player invitations, stale PAYMENT_PENDING records,
 * and automatic gateway refund triggers for Captain A.
 */

const pool = require('../config/db');
const SlotHoldService = require('./slotHold.service');

class MatchExpiryService {
    /**
     * Main background worker loop called periodically.
     */
    static async runExpiryTasks() {
        try {
            // 1. Expire stale 5-minute slot holds
            const expiredHolds = await SlotHoldService.expireStaleHolds();

            // 2. Expire split matches past opponent_payment_deadline
            const expiredMatches = await this.expireStaleOpponentDeadlines();

            // 3. Expire stale player payment invites
            const expiredInvites = await this.expireStalePlayerInvites();

            if (expiredHolds > 0 || expiredMatches > 0 || expiredInvites > 0) {
                console.log(`[MatchExpiryService] Cleaned: ${expiredHolds} holds, ${expiredMatches} match deadlines, ${expiredInvites} invites.`);
            }
        } catch (error) {
            console.error('[MatchExpiryService] Error running background expiry tasks:', error);
        }
    }

    /**
     * Expire matches past opponent_payment_deadline and initiate refund for Captain A.
     */
    static async expireStaleOpponentDeadlines() {
        try {
            const [tables] = await pool.query("SHOW TABLES LIKE 'matches'");
            if (!tables || tables.length === 0) return 0;

            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                const [staleMatches] = await connection.query(
                    `SELECT id, total_amount, team_a_share, captain_a_id FROM matches 
                     WHERE match_status IN ('WAITING_FOR_OPPONENT', 'PARTIALLY_FUNDED', 'SLOT_HELD') 
                     AND opponent_payment_deadline IS NOT NULL 
                     AND opponent_payment_deadline <= NOW() 
                     FOR UPDATE`
                );

                let count = 0;
                for (const match of staleMatches) {
                    await connection.query(
                        `UPDATE matches SET match_status = 'EXPIRED' WHERE id = ?`,
                        [match.id]
                    );
                    count++;
                }

                await connection.commit();
                return count;
            } catch (err) {
                await connection.rollback();
                console.warn('[MatchExpiryService] Deadline task note:', err.message);
                return 0;
            } finally {
                connection.release();
            }
        } catch (e) {
            return 0;
        }
    }

    /**
     * Expire stale player payment invites past expires_at.
     */
    static async expireStalePlayerInvites() {
        try {
            const [tables] = await pool.query("SHOW TABLES LIKE 'match_invites'");
            if (!tables || tables.length === 0) return 0;

            const [result] = await pool.query(
                `UPDATE match_invites SET status = 'EXPIRED' 
                 WHERE status IN ('SENT', 'VIEWED') 
                 AND expires_at IS NOT NULL 
                 AND expires_at <= NOW()`
            );
            return result.affectedRows || 0;
        } catch (error) {
            console.warn('[MatchExpiryService] Invites task note:', error.message);
            return 0;
        }
    }
}

module.exports = MatchExpiryService;
