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
                // Update match status to EXPIRED
                await connection.query(
                    `UPDATE matches SET match_status = 'EXPIRED' WHERE id = ?`,
                    [match.id]
                );

                // Release associated slot holds
                await connection.query(
                    `UPDATE slot_holds SET status = 'EXPIRED' WHERE match_id = ?`,
                    [match.id]
                );

                // Expire all pending invites for this match
                await connection.query(
                    `UPDATE match_invites SET status = 'EXPIRED' WHERE match_id = ? AND status IN ('SENT', 'VIEWED')`,
                    [match.id]
                );

                // Create REFUND_PENDING record for Captain A's paid share
                const refundId = `REFUND-EXP-${match.id}`;
                await connection.query(
                    `INSERT INTO match_payments (id, match_id, user_id, amount, payment_status, refund_reference)
                     VALUES (?, ?, ?, ?, 'REFUND_PENDING', ?)
                     ON DUPLICATE KEY UPDATE payment_status = 'REFUND_PENDING'`,
                    [refundId, match.id, match.captain_a_id, match.team_a_share, `REFUND-DEADLINE-EXPIRED`]
                );

                // Post financial ledger entry
                await connection.query(
                    `INSERT INTO financial_ledger (id, transaction_id, match_id, user_id, type, direction, amount, metadata)
                     VALUES (?, ?, ?, ?, 'REFUND', 'DEBIT', ?, ?)`,
                    [`LEDGER-${Date.now()}-${count}`, `TX-REFUND-${Date.now()}`, match.id, match.captain_a_id, match.team_a_share, JSON.stringify({ reason: 'Opponent Payment Deadline Expired' })]
                );

                // Audit log
                await connection.query(
                    `INSERT INTO match_audit_logs (id, match_id, actor_id, action, reason)
                     VALUES (?, ?, 'SYSTEM_WORKER', 'MATCH_EXPIRED', 'Opponent payment deadline passed. Refund queued.')`,
                    [`AUDIT-${Date.now()}-${count}`, match.id]
                );

                count++;
            }

            await connection.commit();
            return count;
        } catch (error) {
            await connection.rollback();
            console.error('[MatchExpiryService] Error expiring opponent deadlines:', error);
            return 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Expire stale player invites.
     */
    static async expireStalePlayerInvites() {
        try {
            const [result] = await pool.query(
                `UPDATE match_invites SET status = 'EXPIRED' WHERE status IN ('SENT', 'VIEWED') AND expires_at <= NOW()`
            );
            return result.affectedRows;
        } catch (error) {
            console.error('[MatchExpiryService] Error expiring player invites:', error);
            return 0;
        }
    }
}

module.exports = MatchExpiryService;
