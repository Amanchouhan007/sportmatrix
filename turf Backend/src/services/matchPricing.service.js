/**
 * MatchPricingService
 * Server-side authoritative calculation for venue prices, duration multipliers,
 * convenience fees, tax adjustments, split ratio validation, and owner commission snapshots.
 */

const pool = require('../config/db');

class MatchPricingService {
    /**
     * Calculates authoritative pricing and financial snapshot for a match booking.
     */
    static async calculateMatchPricing({ turfId, durationHours = 1, paymentMode, captainShareInput, totalPayingPlayers = 12, ownerPlanId = 'plan_starter' }) {
        let baseHourlyPrice = 1200;

        try {
            const [rows] = await pool.query('SELECT price, regular_price, name, location FROM turfs WHERE id = ?', [turfId]);
            if (rows && rows.length > 0) {
                baseHourlyPrice = rows[0].price || rows[0].regular_price || 1200;
            }
        } catch (err) {
            console.warn('[MatchPricingService] Using fallback base price for turf:', turfId);
        }

        const totalRent = baseHourlyPrice * durationHours;
        const convenienceFeePerPlayer = 30;
        const estimatedPlayers = totalPayingPlayers > 0 ? totalPayingPlayers : 12;
        const totalConvenienceFee = convenienceFeePerPlayer * (paymentMode === 'PER_PLAYER' ? estimatedPlayers : 2);
        const taxAmount = Math.round(totalRent * 0.05); // 5% GST
        const totalBookingAmount = totalRent + totalConvenienceFee + taxAmount;

        let teamAShare = totalRent;
        let teamBShare = 0;
        let perPlayerAmount = 0;
        let depositAmount = 0;

        switch (paymentMode) {
            case 'FULL_PAY':
                teamAShare = totalRent;
                teamBShare = 0;
                break;

            case 'SPLIT_50_50':
                teamAShare = Math.round(totalRent / 2);
                teamBShare = totalRent - teamAShare;
                break;

            case 'CUSTOM_SPLIT':
                if (!captainShareInput || captainShareInput <= 0 || captainShareInput >= totalRent) {
                    teamAShare = Math.round(totalRent * 0.6); // Default 60%
                } else {
                    teamAShare = Math.round(captainShareInput);
                }
                teamBShare = totalRent - teamAShare;
                if (teamAShare <= 0 || teamBShare <= 0 || (teamAShare + teamBShare !== totalRent)) {
                    throw new Error('Invalid custom split amounts. Shares must be > 0 and sum to total rent.');
                }
                break;

            case 'DARE_TO_PLAY':
                depositAmount = 100; // Refundable deposit
                teamAShare = depositAmount;
                teamBShare = depositAmount;
                break;

            case 'PER_PLAYER':
                perPlayerAmount = Math.round(totalRent / estimatedPlayers);
                teamAShare = perPlayerAmount;
                teamBShare = perPlayerAmount;
                break;

            default:
                teamAShare = totalRent;
                teamBShare = 0;
        }

        // Commission Snapshot based on Owner Plan
        let commissionRate = 10.00; // Starter plan 10%
        if (ownerPlanId === 'plan_growth') commissionRate = 8.00;
        if (ownerPlanId === 'plan_pro') commissionRate = 6.00;
        if (ownerPlanId === 'plan_elite') commissionRate = 5.00;

        const platformCommissionAmount = Math.round((totalRent * commissionRate) / 100);
        const ownerNetAmount = totalRent - platformCommissionAmount;

        return {
            baseHourlyPrice,
            durationHours,
            totalRent,
            convenienceFee: totalConvenienceFee,
            taxAmount,
            totalBookingAmount,
            teamAShare,
            teamBShare,
            perPlayerAmount,
            depositAmount,
            commissionRateSnapshot: commissionRate,
            commissionAmountSnapshot: platformCommissionAmount,
            ownerNetAmountSnapshot: ownerNetAmount,
            planIdSnapshot: ownerPlanId,
            financialSnapshot: {
                basePrice: baseHourlyPrice,
                duration: durationHours,
                subtotal: totalRent,
                convenienceFee: totalConvenienceFee,
                tax: taxAmount,
                totalCustomerPayable: totalBookingAmount,
                teamAShare,
                teamBShare,
                perPlayerAmount,
                depositAmount,
                commissionRate,
                platformCommission: platformCommissionAmount,
                ownerNet: ownerNetAmount
            }
        };
    }
}

module.exports = MatchPricingService;
