const prisma = require('../../config/prisma');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const formatProfile = (p) => ({
    id: p.id, _id: p.id, userId: p.userId,
    full_name: p.fullName, license_no: p.licenseNumber,
    certification_level: p.certificationLevel, officiating_grounds: p.officiatingLocations,
    upi_id: p.upiId, qr_image: p.qrImageUrl, match_fee: Number(p.dutyFeePerMatch),
    on_duty_status: p.isOnDuty, rating: Number(p.rating),
    total_matches_officiated: p.totalMatchesOfficiated
});

/** Get (or create-on-first-access) the requesting user's real umpire profile. */
const getUmpireProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        let profile = await prisma.umpireProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) {
            profile = await prisma.umpireProfile.create({
                data: {
                    id: genId('ump'),
                    userId: req.user.id,
                    licenseNumber: `UMP-${req.user.id.slice(-8).toUpperCase()}`,
                    fullName: req.user.name || 'Umpire',
                    totalMatchesOfficiated: 0,
                    totalCertifiedScorecards: 0
                }
            });
        }
        return res.status(200).json({ success: true, data: formatProfile(profile) });
    } catch (error) {
        console.error('Error fetching umpire profile:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateUmpireProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { full_name, upi_id, custom_qr_image, on_duty_status } = req.body;
        const profile = await prisma.umpireProfile.update({
            where: { userId: req.user.id },
            data: {
                fullName: full_name ?? undefined,
                upiId: upi_id ?? undefined,
                qrImageUrl: custom_qr_image ?? undefined,
                isOnDuty: on_duty_status ?? undefined
            }
        }).catch(() => null);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Umpire profile not found. Call GET /umpire/profile first to create it.' });
        }
        return res.status(200).json({ success: true, message: 'Umpire profile updated successfully', data: formatProfile(profile) });
    } catch (error) {
        console.error('Error updating umpire profile:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const formatDuty = (d) => ({
    id: d.id, matchId: d.matchId, branchId: d.branchId,
    dutyFee: Number(d.dutyFee), feePaymentStatus: d.feePaymentStatus,
    tossWinnerTeam: d.tossWinnerTeam, tossElected: d.tossElected,
    ballByBallFeed: d.ballByBallFeed, currentScoreSummary: d.currentScoreSummary,
    dutyStatus: d.dutyStatus, certifiedAt: d.certifiedAt,
    match: d.match ? { id: d.match.id, teamAName: d.match.teamAName, teamBName: d.match.teamBName, matchStatus: d.match.matchStatus } : null
});

const getUmpireMatches = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const profile = await prisma.umpireProfile.findUnique({ where: { userId: req.user.id } });
        const duties = profile
            ? await prisma.umpireDutyAssignment.findMany({ where: { umpireProfileId: profile.id }, include: { match: true }, orderBy: { createdAt: 'desc' } })
            : [];
        return res.status(200).json({ success: true, data: duties.map(formatDuty) });
    } catch (error) {
        console.error('Error fetching umpire matches:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const findMyDuty = async (req, matchId) => {
    const profile = await prisma.umpireProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return null;
    return prisma.umpireDutyAssignment.findFirst({ where: { matchId, umpireProfileId: profile.id } });
};

/** An umpire self-assigns to an existing real Match that still needs officiating. */
const registerGroundMatch = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { matchId } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required.' });
        }

        const match = await prisma.match.findUnique({ where: { id: matchId } });
        if (!match) {
            return res.status(404).json({ success: false, message: 'Match not found.' });
        }
        if (match.hasUmpireAssigned) {
            return res.status(409).json({ success: false, message: 'This match already has an umpire assigned.' });
        }

        let profile = await prisma.umpireProfile.findUnique({ where: { userId: req.user.id } });
        if (!profile) {
            profile = await prisma.umpireProfile.create({
                data: { id: genId('ump'), userId: req.user.id, licenseNumber: `UMP-${req.user.id.slice(-8).toUpperCase()}`, fullName: req.user.name || 'Umpire' }
            });
        }

        const duty = await prisma.$transaction(async (tx) => {
            const created = await tx.umpireDutyAssignment.create({
                data: {
                    id: genId('duty'),
                    matchId: match.id,
                    branchId: match.branchId,
                    umpireProfileId: profile.id,
                    dutyFee: profile.dutyFeePerMatch,
                    dutyStatus: 'SCHEDULED'
                }
            });
            await tx.match.update({ where: { id: match.id }, data: { hasUmpireAssigned: true, umpireAddonFee: profile.dutyFeePerMatch } });
            return created;
        });

        return res.status(201).json({ success: true, message: 'Assigned to match successfully', data: formatDuty(duty) });
    } catch (error) {
        console.error('Error registering ground match:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const recordToss = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { matchId, tossWinner, tossDecision } = req.body;
        if (!matchId || !tossWinner || !tossDecision) {
            return res.status(400).json({ success: false, message: 'matchId, tossWinner and tossDecision are required' });
        }

        const duty = await findMyDuty(req, matchId);
        if (!duty) {
            return res.status(404).json({ success: false, message: 'You are not assigned to this match.' });
        }

        await prisma.umpireDutyAssignment.update({ where: { id: duty.id }, data: { tossWinnerTeam: tossWinner, tossElected: tossDecision, dutyStatus: 'LIVE_NOW' } });
        return res.status(200).json({ success: true, message: 'Toss recorded successfully' });
    } catch (error) {
        console.error('Error recording toss:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateMatchScore = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { matchId, currentScoreSummary, ballByBallFeed, topBatsmanName, topBatsmanRuns, topBowlerName, topBowlerWickets } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        const duty = await findMyDuty(req, matchId);
        if (!duty) {
            return res.status(404).json({ success: false, message: 'You are not assigned to this match.' });
        }

        await prisma.umpireDutyAssignment.update({
            where: { id: duty.id },
            data: {
                currentScoreSummary: currentScoreSummary ?? undefined,
                ballByBallFeed: ballByBallFeed ?? undefined,
                topBatsmanName: topBatsmanName ?? undefined,
                topBatsmanRuns: topBatsmanRuns ?? undefined,
                topBowlerName: topBowlerName ?? undefined,
                topBowlerWickets: topBowlerWickets ?? undefined
            }
        });

        return res.status(200).json({ success: true, message: 'Match score updated successfully' });
    } catch (error) {
        console.error('Error updating match score:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const completeMatch = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { matchId, winnerTeamSide } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        const duty = await findMyDuty(req, matchId);
        if (!duty) {
            return res.status(404).json({ success: false, message: 'You are not assigned to this match.' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.umpireDutyAssignment.update({ where: { id: duty.id }, data: { dutyStatus: 'CERTIFIED_COMPLETED', certifiedAt: new Date() } });
            await tx.match.update({ where: { id: matchId }, data: { matchStatus: 'COMPLETED', winnerTeamSide: winnerTeamSide ?? undefined } });
            await tx.umpireProfile.update({ where: { id: duty.umpireProfileId }, data: { totalMatchesOfficiated: { increment: 1 } } });
        });

        return res.status(200).json({ success: true, message: 'Match completed and certified successfully' });
    } catch (error) {
        console.error('Error completing match:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { matchId, paymentStatus } = req.body;
        if (!matchId) {
            return res.status(400).json({ success: false, message: 'matchId is required' });
        }

        const duty = await findMyDuty(req, matchId);
        if (!duty) {
            return res.status(404).json({ success: false, message: 'You are not assigned to this match.' });
        }

        await prisma.umpireDutyAssignment.update({ where: { id: duty.id }, data: { feePaymentStatus: paymentStatus === 'RECEIVED' ? 'RECEIVED' : 'PENDING' } });
        return res.status(200).json({ success: true, message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getUmpireProfile, updateUmpireProfile, getUmpireMatches,
    updateMatchScore, recordToss, completeMatch, updatePaymentStatus, registerGroundMatch
};
