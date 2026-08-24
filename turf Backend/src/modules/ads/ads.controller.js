const prisma = require('../../config/prisma');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const formatAd = (a) => ({
    id: a.id, _id: a.id,
    name: a.name,
    turfName: a.branch?.branchName || null,
    ownerName: a.owner?.fullName || null,
    ownerEmail: a.owner?.email || null,
    ownerMobile: a.owner?.mobile || null,
    type: a.type, status: a.status, icon: a.icon,
    views: a.views, clicks: a.clicks, bookings: a.bookings,
    revenue: `₹${Number(a.revenue).toLocaleString()}`,
    commissionPaid: `₹${Number(a.commissionPaid).toLocaleString()}`,
    ctr: a.ctr, roi: a.roi, cpa: a.cpa,
    budgetSpent: Number(a.budgetSpent), budgetTotal: Number(a.budgetTotal), dailyBudget: Number(a.dailyBudget),
    commissionRate: Number(a.commissionRate), bookingGoal: a.bookingGoal,
    avgSlotPrice: Number(a.avgSlotPrice), targetRadiusKm: a.targetRadiusKm, estimatedReach: a.estimatedReach,
    startDate: a.startDate?.toISOString().split('T')[0], endDate: a.endDate?.toISOString().split('T')[0],
    description: a.description || '',
    adTitle: a.adTitle || '', shortHeadline: a.shortHeadline || '', ctaText: a.ctaText || '',
    redirectUrl: a.redirectUrl || '', bannerImageUrl: a.bannerImageUrl || '',
    mobileBannerImageUrl: a.mobileBannerImageUrl || '', thumbnailImageUrl: a.thumbnailImageUrl || '',
    videoUrl: a.videoUrl || '', pricingModel: a.pricingModel || '',
    cpmRate: a.cpmRate !== null && a.cpmRate !== undefined ? Number(a.cpmRate) : null,
    placements: a.placements ? a.placements.split(',').filter(Boolean) : []
});

const resolveOwnerBranchIds = async (user) => {
    const branches = await prisma.branch.findMany({ where: { ownerUserId: user.id }, select: { id: true } });
    return branches.map(b => b.id);
};

const getAdvertisements = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { status, type } = req.query;
        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (type && type !== 'ALL') where.type = type;
        if (req.user.role !== 'SUPER_ADMIN') where.branchId = { in: await resolveOwnerBranchIds(req.user) };

        const rows = await prisma.advertisement.findMany({ where, include: { branch: true, owner: true }, orderBy: { createdAt: 'desc' } });
        return res.status(200).json({ success: true, data: rows.map(formatAd) });
    } catch (error) {
        console.error('Fetch advertisements error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching advertisements.' });
    }
};

const assertBranchAccess = async (branchId, user) => {
    if (user.role === 'SUPER_ADMIN') return true;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return !!branch && branch.ownerUserId === user.id;
};

const createAdvertisement = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const {
        branchId, campaignName, name, type = 'GUARANTEED_BOOKING', icon = '📢',
        status, budgetTotal = 5000, dailyBudget = 500, startDate, endDate, description,
        commissionRate, bookingGoal, avgSlotPrice, targetRadiusKm, estimatedReach, durationMonths,
        adTitle, shortHeadline, ctaText, redirectUrl, bannerImageUrl, mobileBannerImageUrl,
        thumbnailImageUrl, videoUrl, pricingModel, cpmRate, placements
    } = req.body;
    const adName = campaignName || name;

    if (!branchId || !adName || !startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'branchId, campaign name, startDate, and endDate are required.' });
    }

    try {
        if (!(await assertBranchAccess(branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        const branch = await prisma.branch.findUnique({ where: { id: branchId } });

        const ad = await prisma.advertisement.create({
            data: {
                id: `AD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                branchId, ownerId: branch.ownerId,
                name: adName, type: type.toUpperCase(), icon,
                status: status ? status.toUpperCase() : undefined,
                budgetTotal, dailyBudget,
                startDate: new Date(startDate), endDate: new Date(endDate),
                description: description || null,
                commissionRate: commissionRate !== undefined ? Number(commissionRate) : undefined,
                bookingGoal: bookingGoal !== undefined ? Number(bookingGoal) : undefined,
                avgSlotPrice: avgSlotPrice !== undefined ? Number(avgSlotPrice) : undefined,
                targetRadiusKm: targetRadiusKm !== undefined ? Number(targetRadiusKm) : undefined,
                estimatedReach: estimatedReach !== undefined ? Number(estimatedReach) : undefined,
                durationMonths: durationMonths !== undefined ? Number(durationMonths) : undefined,
                adTitle: adTitle || null, shortHeadline: shortHeadline || null, ctaText: ctaText || null,
                redirectUrl: redirectUrl || null, bannerImageUrl: bannerImageUrl || null,
                mobileBannerImageUrl: mobileBannerImageUrl || null, thumbnailImageUrl: thumbnailImageUrl || null,
                videoUrl: videoUrl || null, pricingModel: pricingModel || null,
                cpmRate: cpmRate !== undefined && cpmRate !== null ? Number(cpmRate) : undefined,
                placements: Array.isArray(placements) ? placements.join(',') : (placements || null)
            },
            include: { branch: true, owner: true }
        });

        return res.status(201).json({ success: true, message: 'Advertisement campaign created successfully.', data: formatAd(ad) });
    } catch (error) {
        console.error('Create advertisement error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error creating campaign: ' + error.message });
    }
};

const updateAdStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const existing = await prisma.advertisement.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Advertisement campaign not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        await prisma.advertisement.update({ where: { id }, data: { status: status.toUpperCase() } });
        return res.status(200).json({ success: true, message: `Campaign status updated to ${status}` });
    } catch (error) {
        console.error('Update ad status error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating status.' });
    }
};

const deleteAdvertisement = async (req, res) => {
    const { id } = req.params;
    try {
        const existing = await prisma.advertisement.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Advertisement campaign not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        await prisma.advertisement.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Advertisement campaign deleted successfully.' });
    } catch (error) {
        console.error('Delete advertisement error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error deleting campaign.' });
    }
};

const getCommissions = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const { status } = req.query;
        const where = {};
        if (status && status !== 'ALL') where.status = status.toUpperCase();
        if (req.user.role !== 'SUPER_ADMIN') where.branchId = { in: await resolveOwnerBranchIds(req.user) };

        const [rows, poolAgg, pendingAgg, settledAgg] = await Promise.all([
            prisma.adCommission.findMany({ where, include: { advertisement: true, branch: true }, orderBy: { createdAt: 'desc' } }),
            prisma.adCommission.aggregate({ where, _sum: { commissionAmount: true } }),
            prisma.adCommission.aggregate({ where: { ...where, status: 'PENDING' }, _sum: { commissionAmount: true } }),
            prisma.adCommission.aggregate({ where: { ...where, status: 'PAID' }, _sum: { commissionAmount: true } })
        ]);

        return res.status(200).json({
            success: true,
            summary: {
                totalPool: Number(poolAgg._sum.commissionAmount || 0),
                pendingPayouts: Number(pendingAgg._sum.commissionAmount || 0),
                settledCommissions: Number(settledAgg._sum.commissionAmount || 0)
            },
            data: rows.map(r => ({
                bookingId: r.bookingId, adId: r.adId, adName: r.advertisement?.name,
                turfName: r.branch?.branchName,
                bookingAmount: `₹${Number(r.bookingAmount).toLocaleString()}`,
                commission: `₹${Number(r.commissionAmount).toLocaleString()} (${r.commissionRate}%)`,
                ownerAmount: `₹${Number(r.ownerAmount).toLocaleString()}`,
                invoiceNo: r.invoiceNumber, paymentStatus: r.status,
                date: r.createdAt.toISOString().split('T')[0],
                time: r.createdAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            }))
        });
    } catch (error) {
        console.error('Fetch commissions error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching commissions.' });
    }
};

const markCommissionPaid = async (req, res) => {
    try {
        const updated = await prisma.adCommission.updateMany({ where: { bookingId: req.params.bookingId }, data: { status: 'PAID' } });
        if (updated.count === 0) {
            return res.status(404).json({ success: false, message: 'Commission record not found.' });
        }
        return res.status(200).json({ success: true, message: `Commission for booking ${req.params.bookingId} marked as Paid!` });
    } catch (error) {
        console.error('Mark commission paid error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating commission status.' });
    }
};

const getPayments = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const where = {};
        if (req.user.role !== 'SUPER_ADMIN') where.branchId = { in: await resolveOwnerBranchIds(req.user) };

        const rows = await prisma.adPayment.findMany({ where, include: { advertisement: true, branch: true, owner: true }, orderBy: { createdAt: 'desc' } });
        return res.status(200).json({
            success: true,
            data: rows.map(r => ({
                invoiceId: r.invoiceNumber, adName: r.campaignName || r.advertisement?.name,
                adId: r.adId, turfName: r.branch?.branchName, ownerName: r.owner?.fullName,
                amount: `₹${Number(r.totalAmount).toLocaleString()}`,
                paymentMethod: r.paymentMode, status: r.status === 'COMPLETED' ? 'Paid' : 'Pending',
                date: r.billingDate.toISOString().split('T')[0]
            }))
        });
    } catch (error) {
        console.error('Fetch ad payments error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching ad payments: ' + error.message });
    }
};

const getAdAnalytics = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    try {
        const where = {};
        if (req.user.role !== 'SUPER_ADMIN') where.branchId = { in: await resolveOwnerBranchIds(req.user) };

        const ads = await prisma.advertisement.findMany({ where });
        const totalAds = ads.length;
        const activeAds = ads.filter(a => a.status === 'ACTIVE').length;
        const totalRevenue = ads.reduce((sum, a) => sum + Number(a.revenue), 0);
        const adBookings = ads.reduce((sum, a) => sum + a.bookings, 0);
        const totalCommission = ads.reduce((sum, a) => sum + Number(a.commissionPaid), 0);
        const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);
        // Real per-campaign numeric breakdown for charting -- no formatted ₹ strings, no fabricated time-series.
        const campaignsRaw = ads.map(a => ({
            id: a.id, name: a.name, type: a.type,
            views: a.views, clicks: a.clicks, bookings: a.bookings,
            revenue: Number(a.revenue), commissionPaid: Number(a.commissionPaid),
            budgetSpent: Number(a.budgetSpent), budgetTotal: Number(a.budgetTotal)
        }));
        const conversionRate = totalClicks > 0 ? Number(((adBookings / totalClicks) * 100).toFixed(1)) : 0;

        return res.status(200).json({
            success: true,
            data: { totalAds, activeAds, totalRevenue, adBookings, totalCommission, totalClicks, conversionRate, campaigns: ads.map(formatAd), campaignsRaw }
        });
    } catch (error) {
        console.error('Fetch ad analytics error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching ad analytics: ' + error.message });
    }
};

const updateAdvertisement = async (req, res) => {
    const { id } = req.params;
    const {
        name, campaignName, budgetTotal, dailyBudget, startDate, endDate, description, type, icon, status,
        commissionRate, bookingGoal, avgSlotPrice, targetRadiusKm, estimatedReach, durationMonths,
        adTitle, shortHeadline, ctaText, redirectUrl, bannerImageUrl, mobileBannerImageUrl,
        thumbnailImageUrl, videoUrl, pricingModel, cpmRate, placements
    } = req.body;

    try {
        const existing = await prisma.advertisement.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Advertisement not found.' });
        }
        if (!(await assertBranchAccess(existing.branchId, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        const adName = campaignName || name;
        await prisma.advertisement.update({
            where: { id },
            data: {
                name: adName ?? undefined,
                type: type ? type.toUpperCase() : undefined,
                icon: icon ?? undefined,
                status: status ? status.toUpperCase() : undefined,
                budgetTotal: budgetTotal !== undefined ? Number(budgetTotal) : undefined,
                dailyBudget: dailyBudget !== undefined ? Number(dailyBudget) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                description: description ?? undefined,
                commissionRate: commissionRate !== undefined ? Number(commissionRate) : undefined,
                bookingGoal: bookingGoal !== undefined ? Number(bookingGoal) : undefined,
                avgSlotPrice: avgSlotPrice !== undefined ? Number(avgSlotPrice) : undefined,
                targetRadiusKm: targetRadiusKm !== undefined ? Number(targetRadiusKm) : undefined,
                estimatedReach: estimatedReach !== undefined ? Number(estimatedReach) : undefined,
                durationMonths: durationMonths !== undefined ? Number(durationMonths) : undefined,
                adTitle: adTitle ?? undefined, shortHeadline: shortHeadline ?? undefined, ctaText: ctaText ?? undefined,
                redirectUrl: redirectUrl ?? undefined, bannerImageUrl: bannerImageUrl ?? undefined,
                mobileBannerImageUrl: mobileBannerImageUrl ?? undefined, thumbnailImageUrl: thumbnailImageUrl ?? undefined,
                videoUrl: videoUrl ?? undefined, pricingModel: pricingModel ?? undefined,
                cpmRate: cpmRate !== undefined && cpmRate !== null ? Number(cpmRate) : undefined,
                placements: Array.isArray(placements) ? placements.join(',') : (placements ?? undefined)
            }
        });

        return res.status(200).json({ success: true, message: 'Advertisement updated successfully.', data: { id } });
    } catch (error) {
        console.error('Update advertisement error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating advertisement: ' + error.message });
    }
};

module.exports = {
    getAdvertisements, createAdvertisement, updateAdvertisement, updateAdStatus,
    deleteAdvertisement, getCommissions, markCommissionPaid, getPayments, getAdAnalytics
};
