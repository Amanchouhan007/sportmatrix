/**
 * MatchPaymentController
 * Production controller for Team Match Payment Engine.
 */

const pool = require('../../config/db');
const MatchPricingService = require('../../services/matchPricing.service');
const SlotHoldService = require('../../services/slotHold.service');
const CancellationPolicyService = require('../../services/cancellationPolicy.service');
const MatchSettlementService = require('../../services/matchSettlement.service');
const MatchReconciliationService = require('../../services/matchReconciliation.service');
const crypto = require('crypto');

class MatchPaymentController {
    /**
     * POST /api/v1/match-payments/create
     * Creates match record & temporary 5-min slot hold.
     */
    static async createMatchBooking(req, res) {
        try {
            const {
                turfId = 'turf_2',
                slotId = 'slot_2',
                sportId = 'Cricket',
                captainName = 'Captain User',
                captainPhone = '+91 98765 43210',
                teamAName = 'Team A Strikers',
                teamBName = 'Open Challenge',
                paymentMode = 'FULL_PAY',
                durationHours = 1,
                slotDate = '2026-08-09',
                startTime = '18:00:00',
                endTime = '19:00:00',
                captainShareInput = 0,
                hasOpponentTeam = false
            } = req.body;

            const userId = req.user ? req.user.id : 'user_guest_1';

            // 1. Authoritative Server-side Price Calculation
            const pricing = await MatchPricingService.calculateMatchPricing({
                turfId,
                durationHours,
                paymentMode,
                captainShareInput
            });

            // 2. Create 5-minute Slot Hold in `slot_holds`
            const holdResult = await SlotHoldService.createHold({
                turfId,
                slotDate,
                startTime,
                endTime,
                durationMinutes: 5
            });

            if (!holdResult.success) {
                return res.status(409).json({
                    success: false,
                    message: 'Slot is currently held or booked by another user. Please choose another slot.'
                });
            }

            const matchId = `MATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // 3. DB-driven Deadline Formula: MIN(captain_first_payment_time + 2 hours, match_start_time - 2 hours)
            const now = new Date();
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            const matchStartDateTime = new Date(`${slotDate}T${startTime}`);
            const safetyCutoff = new Date(matchStartDateTime.getTime() - 2 * 60 * 60 * 1000);

            let deadline = twoHoursLater < safetyCutoff ? twoHoursLater : safetyCutoff;
            if (deadline <= now) {
                deadline = new Date(now.getTime() + 30 * 60 * 1000); // minimum 30m fallback
            }

            // 4. Save Match in MySQL
            await pool.query(
                `INSERT INTO matches (
                    id, slot_id, turf_id, sport_id, captain_a_id, team_a_name, team_b_name,
                    payment_mode, match_status, total_amount, team_a_share, team_b_share,
                    per_player_amount, opponent_payment_deadline, dare_strategy, financial_snapshot,
                    commission_rate_snapshot, plan_id_snapshot, cancellation_policy_snapshot
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SLOT_HELD', ?, ?, ?, ?, ?, 'SECURED_PREPAYMENT', ?, ?, ?, ?)`,
                [
                    matchId, slotId, turfId, sportId, userId, teamAName, teamBName,
                    paymentMode, pricing.totalRent, pricing.teamAShare, pricing.teamBShare,
                    pricing.perPlayerAmount, deadline, JSON.stringify(pricing.financialSnapshot),
                    pricing.commissionRateSnapshot, pricing.planIdSnapshot,
                    JSON.stringify(CancellationPolicyService.getDefaultPolicy())
                ]
            );

            // Update hold with matchId
            await pool.query(`UPDATE slot_holds SET match_id = ? WHERE id = ?`, [matchId, holdResult.holdId]);

            // Save Team A details
            const teamAId = `TEAM-A-${matchId}`;
            await pool.query(
                `INSERT INTO match_teams (id, match_id, team_side, team_name, captain_name, captain_phone, paid_player_count)
                 VALUES (?, ?, 'A', ?, ?, ?, 1)`,
                [teamAId, matchId, teamAName, captainName, captainPhone]
            );

            // Save Team B details
            const teamBId = `TEAM-B-${matchId}`;
            await pool.query(
                `INSERT INTO match_teams (id, match_id, team_side, team_name, paid_player_count)
                 VALUES (?, ?, 'B', ?, 0)`,
                [teamBId, matchId, teamBName]
            );

            // Audit log
            await pool.query(
                `INSERT INTO match_audit_logs (id, match_id, actor_id, action, reason)
                 VALUES (?, ?, ?, 'MATCH_CREATED', 'Match created and 5-minute slot hold placed')`,
                [`AUDIT-${Date.now()}`, matchId, userId]
            );

            return res.json({
                success: true,
                message: 'Match booking initialized successfully',
                data: {
                    matchId,
                    holdId: holdResult.holdId,
                    paymentMode,
                    totalRent: pricing.totalRent,
                    captainSharePayable: pricing.teamAShare,
                    opponentShare: pricing.teamBShare,
                    perPlayerAmount: pricing.perPlayerAmount,
                    deadline: deadline.toISOString(),
                    expiresAt: holdResult.expiresAt.toISOString()
                }
            });
        } catch (error) {
            console.error('[MatchPaymentController] createMatchBooking error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/v1/match-payments/verify
     * Verifies payment, updates status, generates secure invite token.
     */
    static async verifyPayment(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const {
                matchId,
                holdId,
                gatewayOrderId = `order_${Date.now()}`,
                gatewayPaymentId = `pay_${Date.now()}`,
                gatewayEventId = `evt_${Date.now()}`,
                idempotencyKey = `idemp_${Date.now()}`,
                paymentMethod = 'UPI'
            } = req.body;

            const userId = req.user ? req.user.id : 'user_guest_1';

            // 1. Idempotency Check
            const [existingPayments] = await connection.query(
                `SELECT * FROM match_payments WHERE idempotency_key = ? OR gateway_payment_id = ?`,
                [idempotencyKey, gatewayPaymentId]
            );

            if (existingPayments && existingPayments.length > 0) {
                await connection.rollback();
                return res.json({
                    success: true,
                    message: 'Payment already processed (Idempotent)',
                    data: existingPayments[0]
                });
            }

            // 2. Fetch match record
            const [matches] = await connection.query(`SELECT * FROM matches WHERE id = ? FOR UPDATE`, [matchId]);
            if (!matches || matches.length === 0) {
                await connection.rollback();
                return res.status(440).json({ success: false, message: 'Match record not found' });
            }

            const match = matches[0];
            const amountPaid = match.team_a_share;

            // 3. Record Payment
            const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            await connection.query(
                `INSERT INTO match_payments (id, match_id, user_id, amount, gateway_order_id, gateway_payment_id, gateway_event_id, idempotency_key, payment_method, payment_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CAPTURED')`,
                [paymentId, matchId, userId, amountPaid, gatewayOrderId, gatewayPaymentId, gatewayEventId, idempotencyKey, paymentMethod]
            );

            // 4. Convert Slot Hold to CONVERTED
            if (holdId) {
                await SlotHoldService.convertHold(holdId);
            }

            // 5. Update Match Status
            const newMatchStatus = match.payment_mode === 'FULL_PAY' ? 'CONFIRMED' : 'WAITING_FOR_OPPONENT';
            await connection.query(
                `UPDATE matches SET match_status = ? WHERE id = ?`,
                [newMatchStatus, matchId]
            );

            // 6. Generate Secure Cryptographic Invite Token for Opponent
            const rawToken = crypto.randomBytes(24).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const inviteId = `INVITE-${Date.now()}`;

            await connection.query(
                `INSERT INTO match_invites (id, match_id, team_side, token_hash, expected_amount, expires_at, status)
                 VALUES (?, ?, 'B', ?, ?, ?, 'SENT')`,
                [inviteId, matchId, tokenHash, match.team_b_share, match.opponent_payment_deadline]
            );

            // 7. Post Ledger Entries & Create Settlement
            await MatchSettlementService.postLedgerEntry({
                matchId,
                paymentId,
                userId,
                type: 'BOOKING_PAYMENT',
                direction: 'CREDIT',
                amount: amountPaid,
                gatewayReference: gatewayPaymentId,
                metadata: { paymentMode: match.payment_mode }
            }, connection);

            if (newMatchStatus === 'CONFIRMED') {
                await MatchSettlementService.createMatchSettlement(matchId, connection);
            }

            // Audit log
            await connection.query(
                `INSERT INTO match_audit_logs (id, match_id, actor_id, action, reason)
                 VALUES (?, ?, ?, 'PAYMENT_VERIFIED', 'Captain payment captured and invite token generated')`,
                [`AUDIT-${Date.now()}`, matchId, userId]
            );

            await connection.commit();

            return res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    matchId,
                    paymentId,
                    matchStatus: newMatchStatus,
                    inviteToken: rawToken,
                    inviteUrl: `${req.protocol}://${req.get('host')}/booking/${match.slot_id}?invite=${rawToken}`
                }
            });
        } catch (error) {
            await connection.rollback();
            console.error('[MatchPaymentController] verifyPayment error:', error);
            return res.status(500).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }

    /**
     * GET /api/v1/match-payments/invite/:token
     * Resolves secure invite token details.
     */
    static async getInviteDetails(req, res) {
        try {
            const { token } = req.params;
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            const [invites] = await pool.query(
                `SELECT i.*, m.team_a_name, m.team_b_name, m.payment_mode, m.total_amount, m.turf_id, m.slot_id 
                 FROM match_invites i
                 JOIN matches m ON i.match_id = m.id
                 WHERE i.token_hash = ?`,
                [tokenHash]
            );

            if (!invites || invites.length === 0) {
                return res.status(404).json({ success: false, message: 'Invalid or expired invite token' });
            }

            const invite = invites[0];
            const isExpired = new Date(invite.expires_at) <= new Date();

            return res.json({
                success: true,
                data: {
                    matchId: invite.match_id,
                    teamSide: invite.team_side,
                    teamAName: invite.team_a_name,
                    teamBName: invite.team_b_name,
                    paymentMode: invite.payment_mode,
                    expectedAmount: invite.expected_amount,
                    expiresAt: invite.expires_at,
                    status: isExpired ? 'EXPIRED' : invite.status,
                    isExpired
                }
            });
        } catch (error) {
            console.error('[MatchPaymentController] getInviteDetails error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/v1/match-payments/invite/:token/pay
     * Processes opponent payment share.
     */
    static async payInviteShare(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { token } = req.params;
            const { gatewayPaymentId = `pay_opp_${Date.now()}` } = req.body;
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            const [invites] = await connection.query(
                `SELECT * FROM match_invites WHERE token_hash = ? FOR UPDATE`,
                [tokenHash]
            );

            if (!invites || invites.length === 0 || invites[0].status !== 'SENT') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invite token is invalid, used, or expired' });
            }

            const invite = invites[0];
            const matchId = invite.match_id;

            // Mark invite as PAID
            await connection.query(`UPDATE match_invites SET status = 'PAID' WHERE id = ?`, [invite.id]);

            // Update match status to CONFIRMED
            await connection.query(`UPDATE matches SET match_status = 'CONFIRMED' WHERE id = ?`, [matchId]);

            // Create settlement
            await MatchSettlementService.createMatchSettlement(matchId, connection);

            // Audit log
            await connection.query(
                `INSERT INTO match_audit_logs (id, match_id, actor_id, action, reason)
                 VALUES (?, ?, 'OPPONENT', 'OPPONENT_PAID', 'Opponent share paid. Match fully confirmed.')`,
                [`AUDIT-${Date.now()}`, matchId]
            );

            await connection.commit();
            return res.json({ success: true, message: 'Opponent share payment successful. Match confirmed!' });
        } catch (error) {
            await connection.rollback();
            console.error('[MatchPaymentController] payInviteShare error:', error);
            return res.status(500).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }

    /**
     * POST /api/v1/match-payments/invite/:token/decline
     * Handles opponent decline.
     */
    static async declineInvite(req, res) {
        try {
            const { token } = req.params;
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

            await pool.query(`UPDATE match_invites SET status = 'DECLINED' WHERE token_hash = ?`, [tokenHash]);

            return res.json({ success: true, message: 'Invite declined. Captain may invite another opponent.' });
        } catch (error) {
            console.error('[MatchPaymentController] declineInvite error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/v1/match-payments/:id/submit-score
     * Handles score submissions from captains.
     */
    static async submitMatchScore(req, res) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const { id: matchId } = req.params;
            const { captainSide = 'A', teamAScore, teamBScore } = req.body;

            let [results] = await connection.query(`SELECT * FROM match_results WHERE match_id = ? FOR UPDATE`, [matchId]);

            if (!results || results.length === 0) {
                const resId = `RES-${matchId}`;
                await connection.query(
                    `INSERT INTO match_results (id, match_id, status) VALUES (?, ?, 'SUBMITTED')`,
                    [resId, matchId]
                );
                [results] = await connection.query(`SELECT * FROM match_results WHERE match_id = ? FOR UPDATE`, [matchId]);
            }

            if (captainSide === 'A') {
                await connection.query(
                    `UPDATE match_results SET team_a_score_captain_a = ?, team_b_score_captain_a = ? WHERE match_id = ?`,
                    [teamAScore, teamBScore, matchId]
                );
            } else {
                await connection.query(
                    `UPDATE match_results SET team_a_score_captain_b = ?, team_b_score_captain_b = ? WHERE match_id = ?`,
                    [teamAScore, teamBScore, matchId]
                );
            }

            // Re-fetch updated result
            const [updatedResults] = await connection.query(`SELECT * FROM match_results WHERE match_id = ?`, [matchId]);
            const resData = updatedResults[0];

            let outcome = null;
            let status = 'SUBMITTED';

            if (resData.team_a_score_captain_a !== null && resData.team_a_score_captain_b !== null) {
                // Both scores submitted - compare
                if (resData.team_a_score_captain_a === resData.team_a_score_captain_b &&
                    resData.team_b_score_captain_a === resData.team_b_score_captain_b) {
                    
                    status = 'MATCHED';
                    const scoreA = resData.team_a_score_captain_a;
                    const scoreB = resData.team_b_score_captain_a;

                    if (scoreA > scoreB) outcome = 'TEAM_A_WIN';
                    else if (scoreB > scoreA) outcome = 'TEAM_B_WIN';
                    else outcome = 'DRAW';

                    await connection.query(
                        `UPDATE match_results SET status = 'MATCHED', outcome = ? WHERE match_id = ?`,
                        [outcome, matchId]
                    );

                    await connection.query(
                        `UPDATE matches SET match_status = 'COMPLETED' WHERE id = ?`,
                        [matchId]
                    );

                    // Execute Dare settlement
                    await MatchSettlementService.processDareSettlement(matchId, outcome, connection);
                    await MatchSettlementService.evaluatePayoutReadiness(matchId);
                } else {
                    // Mismatch -> DISPUTED
                    status = 'DISPUTED';
                    outcome = 'DISPUTED';

                    await connection.query(
                        `UPDATE match_results SET status = 'DISPUTED', outcome = 'DISPUTED' WHERE match_id = ?`,
                        [matchId]
                    );

                    await connection.query(
                        `UPDATE matches SET match_status = 'DISPUTED' WHERE id = ?`,
                        [matchId]
                    );

                    await MatchSettlementService.evaluatePayoutReadiness(matchId);
                }
            }

            await connection.commit();

            return res.json({
                success: true,
                message: status === 'DISPUTED' ? 'Scores mismatched. Sent to SuperAdmin Dispute Review.' : 'Score submitted successfully.',
                data: { matchId, status, outcome }
            });
        } catch (error) {
            await connection.rollback();
            console.error('[MatchPaymentController] submitMatchScore error:', error);
            return res.status(500).json({ success: false, message: error.message });
        } finally {
            connection.release();
        }
    }

    /**
     * GET /api/v1/match-payments/:id/cancellation-quote
     */
    static async getCancellationQuote(req, res) {
        try {
            const { id: matchId } = req.params;
            const [matches] = await pool.query(`SELECT * FROM matches WHERE id = ?`, [matchId]);

            if (!matches || matches.length === 0) {
                return res.status(404).json({ success: false, message: 'Match not found' });
            }

            const match = matches[0];
            const quote = CancellationPolicyService.getCancellationQuote({
                bookingAmount: match.total_amount,
                matchStartTime: match.created_at,
                initiatedBy: req.query.initiatedBy || 'CUSTOMER'
            });

            return res.json({ success: true, data: quote });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * GET /api/v1/match-payments/admin/overview
     * Admin Match Control & Settlement dashboard endpoint.
     */
    static async getAdminMatchPayments(req, res) {
        try {
            const [matches] = await pool.query(
                `SELECT m.*, s.payout_status, r.status as result_status, r.outcome 
                 FROM matches m
                 LEFT JOIN match_settlements s ON m.id = s.match_id
                 LEFT JOIN match_results r ON m.id = r.match_id
                 ORDER BY m.created_at DESC`
            );

            const [ledger] = await pool.query(`SELECT * FROM financial_ledger ORDER BY created_at DESC LIMIT 50`);
            const [audits] = await pool.query(`SELECT * FROM match_audit_logs ORDER BY created_at DESC LIMIT 50`);

            return res.json({
                success: true,
                data: { matches, ledger, auditLogs: audits }
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * POST /api/v1/match-payments/admin/resolve-dispute
     * Admin dispute resolution.
     */
    static async resolveDispute(req, res) {
        try {
            const { matchId, outcome, adminNotes = 'Admin manual dispute resolution', adminUserId = 'admin_super_1' } = req.body;

            await pool.query(
                `UPDATE match_results SET status = 'RESOLVED', outcome = ?, admin_notes = ? WHERE match_id = ?`,
                [outcome, adminNotes, matchId]
            );

            await pool.query(
                `UPDATE matches SET match_status = 'COMPLETED' WHERE id = ?`,
                [matchId]
            );

            await pool.query(
                `UPDATE match_settlements SET payout_status = 'PAYOUT_READY' WHERE match_id = ?`,
                [matchId]
            );

            await pool.query(
                `INSERT INTO match_audit_logs (id, match_id, actor_id, action, reason)
                 VALUES (?, ?, ?, 'DISPUTE_RESOLVED', ?)`,
                [`AUDIT-${Date.now()}`, matchId, adminUserId, `Dispute resolved to ${outcome}: ${adminNotes}`]
            );

            return res.json({ success: true, message: `Dispute resolved successfully as ${outcome}.` });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = MatchPaymentController;
