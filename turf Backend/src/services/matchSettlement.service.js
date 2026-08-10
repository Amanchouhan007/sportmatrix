/**
 * MatchSettlementService
 * Handles commission snapshot calculation, owner payable net, Dare Mode winner/loser settlement,
 * Draw split settlement, refund reversals, dispute holds, and owner payout readiness lifecycle.
 */

const pool = require('../config/db');

class MatchSettlementService {
    /**
     * Posts an immutable transaction entry to financial_ledger table.
     */
    static async postLedgerEntry({ transactionId, matchId, paymentId = null, userId = null, ownerId = null, type, direction, amount, gatewayReference = null, metadata = {} }, connection = pool) {
        const id = `LEDGER-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const txId = transactionId || `TX-${Date.now()}`;

        await connection.query(
            `INSERT INTO financial_ledger (id, transaction_id, match_id, payment_id, user_id, owner_id, type, direction, amount, gateway_reference, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, txId, matchId, paymentId, userId, ownerId, type, direction, amount, gatewayReference, JSON.stringify(metadata)]
        );

        return id;
    }

    /**
     * Generates settlement ledger records when a match is CONFIRMED.
     */
    static async createMatchSettlement(matchId, connection = pool) {
        const [matches] = await connection.query(`SELECT * FROM matches WHERE id = ?`, [matchId]);
        if (!matches || matches.length === 0) return null;

        const match = matches[0];
        const grossAmount = match.total_amount;
        const commissionRate = match.commission_rate_snapshot || 10.00;
        const platformCommission = Math.round((grossAmount * commissionRate) / 100);
        const ownerNetAmount = grossAmount - platformCommission;

        const settlementId = `SETTLE-${matchId}`;
        await connection.query(
            `INSERT INTO match_settlements (id, match_id, gross_amount, commission_rate, platform_commission, owner_net_amount, payout_status)
             VALUES (?, ?, ?, ?, ?, ?, 'PAYOUT_NOT_READY')
             ON DUPLICATE KEY UPDATE 
                gross_amount = VALUES(gross_amount),
                platform_commission = VALUES(platform_commission),
                owner_net_amount = VALUES(owner_net_amount)`,
            [settlementId, matchId, grossAmount, commissionRate, platformCommission, ownerNetAmount]
        );

        // Record Ledger Entries
        await this.postLedgerEntry({
            matchId,
            type: 'PLATFORM_COMMISSION',
            direction: 'CREDIT',
            amount: platformCommission,
            metadata: { commissionRate }
        }, connection);

        await this.postLedgerEntry({
            matchId,
            type: 'OWNER_PAYABLE',
            direction: 'CREDIT',
            amount: ownerNetAmount,
            metadata: { grossAmount, platformCommission }
        }, connection);

        return { settlementId, grossAmount, platformCommission, ownerNetAmount };
    }

    /**
     * Evaluates payout readiness for completed matches (PAYOUT_NOT_READY -> PAYOUT_READY).
     */
    static async evaluatePayoutReadiness(matchId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [matches] = await connection.query(`SELECT * FROM matches WHERE id = ? FOR UPDATE`, [matchId]);
            if (!matches || matches.length === 0) {
                await connection.rollback();
                return null;
            }

            const match = matches[0];

            // 1. Check if match is DISPUTED, CANCELLED, or REFUND_PENDING
            if (['DISPUTED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'].includes(match.match_status)) {
                await connection.query(
                    `UPDATE match_settlements SET payout_status = 'PAYOUT_ON_HOLD' WHERE match_id = ?`,
                    [matchId]
                );
                await this.postLedgerEntry({
                    matchId,
                    type: 'DISPUTE_HOLD',
                    direction: 'DEBIT',
                    amount: match.total_amount,
                    metadata: { reason: `Match status is ${match.match_status}` }
                }, connection);

                await connection.commit();
                return { status: 'PAYOUT_ON_HOLD' };
            }

            // 2. Mark PAYOUT_READY if completed cleanly
            if (['CONFIRMED', 'COMPLETED'].includes(match.match_status)) {
                await connection.query(
                    `UPDATE match_settlements SET payout_status = 'PAYOUT_READY' WHERE match_id = ?`,
                    [matchId]
                );
                await connection.commit();
                return { status: 'PAYOUT_READY' };
            }

            await connection.rollback();
            return { status: 'PAYOUT_NOT_READY' };
        } catch (error) {
            await connection.rollback();
            console.error('[MatchSettlementService] Error evaluating payout readiness:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Process Dare Mode Settlement based on final scores
     */
    static async processDareSettlement(matchId, outcome, connection = pool) {
        const [matches] = await connection.query(`SELECT * FROM matches WHERE id = ?`, [matchId]);
        if (!matches || matches.length === 0) return null;

        const match = matches[0];
        const totalRent = match.total_amount;

        if (outcome === 'TEAM_A_WIN') {
            // Team A wins: refund Team A deposit ₹100, charge Team B full rent ₹1,800
            await this.postLedgerEntry({
                matchId,
                type: 'DEPOSIT_RELEASE',
                direction: 'DEBIT',
                amount: 100,
                metadata: { outcome, beneficiary: 'TEAM_A' }
            }, connection);

            await this.postLedgerEntry({
                matchId,
                type: 'DARE_CAPTURE',
                direction: 'CREDIT',
                amount: totalRent,
                metadata: { outcome, chargedTeam: 'TEAM_B' }
            }, connection);
        } else if (outcome === 'TEAM_B_WIN') {
            // Team B wins: refund Team B deposit ₹100, charge Team A full rent ₹1,800
            await this.postLedgerEntry({
                matchId,
                type: 'DEPOSIT_RELEASE',
                direction: 'DEBIT',
                amount: 100,
                metadata: { outcome, beneficiary: 'TEAM_B' }
            }, connection);

            await this.postLedgerEntry({
                matchId,
                type: 'DARE_CAPTURE',
                direction: 'CREDIT',
                amount: totalRent,
                metadata: { outcome, chargedTeam: 'TEAM_A' }
            }, connection);
        } else if (outcome === 'DRAW') {
            // Draw: split ₹900 each, release both ₹100 deposits
            await this.postLedgerEntry({
                matchId,
                type: 'DEPOSIT_RELEASE',
                direction: 'DEBIT',
                amount: 200,
                metadata: { outcome, note: 'Released Team A and Team B deposits' }
            }, connection);

            await this.postLedgerEntry({
                matchId,
                type: 'DARE_CAPTURE',
                direction: 'CREDIT',
                amount: Math.round(totalRent / 2),
                metadata: { outcome, chargedTeam: 'TEAM_A' }
            }, connection);

            await this.postLedgerEntry({
                matchId,
                type: 'DARE_CAPTURE',
                direction: 'CREDIT',
                amount: Math.round(totalRent / 2),
                metadata: { outcome, chargedTeam: 'TEAM_B' }
            }, connection);
        }

        return true;
    }
}

module.exports = MatchSettlementService;
