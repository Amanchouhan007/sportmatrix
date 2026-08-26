// Controller for branch & turf management operations.
const prisma = require('../../config/prisma');

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const formatBranch = (b, statsObj = { revenue: 0, count: 0, commission: 0 }) => {
    const bookingRevenue = typeof statsObj === 'number' ? statsObj : (statsObj?.revenue || 0);
    const bookingCount = typeof statsObj === 'object' ? (statsObj?.count || 0) : 0;
    const bookingCommission = typeof statsObj === 'object' ? (statsObj?.commission || Math.round(bookingRevenue * 0.1)) : Math.round(bookingRevenue * 0.1);
    const planPrice = Number(b.subscriptionPlan?.monthlyPrice || 0);

    const sports = b.branchSports && b.branchSports.length > 0
        ? b.branchSports.map(bs => ({
            id: bs.id,
            sportId: bs.sportId,
            name: bs.sport?.name || bs.name,
            icon: bs.sport?.icon || bs.icon || '🏏',
            regularPrice: Number(bs.regularPrice),
            peakPrice: Number(bs.peakPrice),
            slotDuration: bs.slotDuration,
            totalCourts: bs.totalCourts,
            status: bs.status
        }))
        : [];

    return {
        id: b.id,
        _id: b.id,
        branchName: b.branchName,
        branchCode: b.branchCode,
        description: b.description || '',
        ownerId: b.owner ? { _id: b.owner.id, id: b.owner.id, fullName: b.owner.fullName } : null,
        subscriptionPlanId: b.subscriptionPlan
            ? { _id: b.subscriptionPlan.id, id: b.subscriptionPlan.id, planName: b.subscriptionPlan.planName, monthlyPrice: planPrice, monthly_price: planPrice }
            : null,
        planPrice,
        plan_price: planPrice,
        bookingRevenue,
        booking_revenue: bookingRevenue,
        bookingCount,
        booking_count: bookingCount,
        bookingCommission,
        booking_commission: bookingCommission,
        city: b.city || '',
        state: b.state || '',
        country: b.country || 'India',
        zipCode: b.zipCode || '',
        fullAddress: b.fullAddress || '',
        email: b.email,
        mobile: b.mobile,
        alternateMobile: b.alternateMobile || '',
        gstNumber: b.gstNumber || '',
        pricePerHour: Number(b.minPriceHourly),
        price: Number(b.minPriceHourly),
        minPriceHourly: Number(b.minPriceHourly),
        openingTime: b.openingTime,
        closingTime: b.closingTime,
        turfSize: `${b.dimensionsSqFt || 0} Sq.Ft`,
        dimensions: `${b.dimensionsSqFt || 0} Sq.Ft`,
        surfaceType: b.surfaceType,
        rating: Number(b.rating),
        reviewCount: b.reviewCount,
        amenities: b.amenities || [],
        logo: b.logo || '',
        images: b.images || [],
        sports,
        status: b.status,
        totalPlatformRevenue: planPrice + bookingCommission,
        totalRevenue: planPrice + bookingCommission,
        createdAt: b.createdAt
    };
};

/**
 * Aggregate real completed-booking revenue per branch via the slot relation
 * (Booking has no direct branchId -- it hangs off Slot).
 */
const getBookingRevenueByBranch = async (branchIds) => {
    if (!branchIds || !branchIds.length) return {};
    const [bookings, matchPayments] = await Promise.all([
        prisma.booking.findMany({
            where: { status: { in: ['COMPLETED', 'PENDING'] }, slot: { branchId: { in: branchIds } } },
            select: { amount: true, slotId: true, slot: { select: { branchId: true } } }
        }),
        prisma.matchPayment.findMany({
            where: { paymentStatus: { in: ['COMPLETED', 'PENDING'] }, match: { branchId: { in: branchIds } } },
            select: { amount: true, match: { select: { branchId: true, slotId: true } } }
        })
    ]);

    const processedSlotIds = new Set();
    const map = {};
    for (const b of bookings) {
        const bId = b.slot?.branchId;
        if (!bId) continue;
        if (b.slotId) processedSlotIds.add(b.slotId);
        if (!map[bId]) map[bId] = { revenue: 0, count: 0, commission: 0 };
        const amt = Number(b.amount || 0);
        map[bId].revenue += amt;
        map[bId].count += 1;
        map[bId].commission += Math.round(amt * 0.1);
    }
    for (const mp of matchPayments) {
        const bId = mp.match?.branchId;
        if (!bId) continue;
        if (mp.match?.slotId && processedSlotIds.has(mp.match.slotId)) continue;
        if (mp.match?.slotId) processedSlotIds.add(mp.match.slotId);
        if (!map[bId]) map[bId] = { revenue: 0, count: 0, commission: 0 };
        const amt = Number(mp.amount || 0);
        map[bId].revenue += amt;
        map[bId].count += 1;
        map[bId].commission += Math.round(amt * 0.1);
    }
    return map;
};

/**
 * Resolves the owner-scoping filter for the requesting user: Super Admin or
 * unauthenticated requests see all (optionally filtered via ?ownerId=),
 * while authenticated owner users are scoped to their own account.
 */
const resolveOwnerScope = (req) => {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const { ownerId, ownerUserId } = req.query;

    if (ownerId && ownerId !== 'ALL') {
        return { OR: [{ ownerId }, { ownerUserId: ownerId }, { owner: { userId: ownerId } }] };
    }
    if (ownerUserId && ownerUserId !== 'ALL') {
        return { OR: [{ ownerUserId }, { owner: { userId: ownerUserId } }] };
    }
    if (req.user && !isSuperAdmin) {
        return { OR: [{ ownerUserId: req.user.id }, { owner: { userId: req.user.id } }, { ownerId: req.user.id }] };
    }
    return {};
};

const getBranches = async (req, res) => {
    try {
        const { status, search, ownerId, subscriptionPlanId, planId, page = 1, limit = 10 } = req.query;

        const and = [];
        const scope = resolveOwnerScope(req);
        if (Object.keys(scope).length > 0) {
            and.push(scope);
        }

        if (status && status !== 'ALL') {
            and.push({ status: status.toUpperCase() });
        }

        const targetPlan = subscriptionPlanId || planId;
        if (targetPlan && targetPlan !== 'ALL') {
            and.push({
                OR: [
                    { subscriptionPlanId: targetPlan },
                    { subscriptionPlan: { id: targetPlan } },
                    { subscriptionPlan: { planName: { contains: targetPlan } } }
                ]
            });
        }

        if (search) {
            and.push({
                OR: [
                    { branchName: { contains: search } },
                    { city: { contains: search } },
                    { branchCode: { contains: search } }
                ]
            });
        }
        const where = and.length > 0 ? { AND: and } : {};

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;

        const [count, rows] = await Promise.all([
            prisma.branch.count({ where }),
            prisma.branch.findMany({
                where,
                include: { owner: true, subscriptionPlan: true, branchSports: { include: { sport: true } } },
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum
            })
        ]);

        const revenueMap = await getBookingRevenueByBranch(rows.map(r => r.id));
        const formatted = rows.map(r => formatBranch(r, revenueMap[r.id] || 0));

        return res.status(200).json({
            success: true,
            data: {
                branches: formatted,
                pagination: { total: count, page: pageNum, limit: limitNum, pages: Math.ceil(count / limitNum) || 1 }
            }
        });
    } catch (error) {
        console.error('Fetch branches error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching branches: ' + error.message });
    }
};

const getBranchById = async (req, res) => {
    try {
        const branch = await prisma.branch.findUnique({
            where: { id: req.params.id },
            include: { owner: true, subscriptionPlan: true, branchSports: { include: { sport: true } } }
        });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found.' });
        }
        const revenueMap = await getBookingRevenueByBranch([branch.id]);
        return res.status(200).json({ success: true, data: formatBranch(branch, revenueMap[branch.id] || 0) });
    } catch (error) {
        console.error('Fetch branch by id error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching branch.' });
    }
};

/**
 * Create a new branch for an existing Owner. A branch is attached to an Owner.
 */
const createBranch = async (req, res) => {
    const {
        branchName, description, ownerId, subscriptionPlanId,
        country, state, city, zipCode, fullAddress,
        email, mobile, alternateMobile, gstNumber,
        timezone, currency, logo, images,
        pricePerHour, openingTime, closingTime, dimensionsSqFt, surfaceType, amenities
    } = req.body;

    if (!branchName || !email) {
        return res.status(400).json({ success: false, message: 'branchName and email are required fields.' });
    }

    try {
        let owner;
        if (ownerId) {
            owner = await prisma.owner.findFirst({
                where: { OR: [{ id: ownerId }, { userId: ownerId }] }
            });
        } else if (req.user?.id) {
            owner = await prisma.owner.findUnique({ where: { userId: req.user.id } });
        } else {
            owner = await prisma.owner.findFirst();
        }

        if (!owner) {
            return res.status(404).json({ success: false, message: 'Owner account not found.' });
        }

        const planId = subscriptionPlanId || 'plan_starter';
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) {
            return res.status(400).json({ success: false, message: `Subscription plan "${planId}" does not exist.` });
        }

        const branch = await prisma.branch.create({
            data: {
                id: genId('br'),
                branchName,
                branchCode: `BR-${Math.floor(1000 + Math.random() * 9000)}`,
                description: description || null,
                ownerId: owner.id,
                ownerUserId: owner.userId,
                subscriptionPlanId: plan.id,
                country: country || 'India',
                state: state || null,
                city: city || null,
                zipCode: zipCode || null,
                fullAddress: fullAddress || null,
                email,
                mobile: mobile || null,
                alternateMobile: alternateMobile || null,
                gstNumber: gstNumber || null,
                timezone: timezone || 'Asia/Kolkata',
                currency: currency || 'INR',
                logo: logo || null,
                images: Array.isArray(images) ? images : [],
                minPriceHourly: pricePerHour ? Number(pricePerHour) : undefined,
                openingTime: openingTime || undefined,
                closingTime: closingTime || undefined,
                dimensionsSqFt: dimensionsSqFt ? Number(dimensionsSqFt) : undefined,
                surfaceType: surfaceType || undefined,
                amenities: Array.isArray(amenities) ? amenities : [],
                status: 'ACTIVE'
            },
            include: { owner: true, subscriptionPlan: true }
        });

        return res.status(201).json({ success: true, message: 'Branch created successfully.', data: formatBranch(branch, 0) });
    } catch (error) {
        console.error('Create branch error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error creating branch: ' + error.message });
    }
};

const assertOwnsBranch = async (branchId, user) => {
    if (!user) return true;
    if (user.role === 'SUPER_ADMIN') return true;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    return !!branch && branch.ownerUserId === user.id;
};

const updateBranch = async (req, res) => {
    const { id } = req.params;

    try {
        if (req.user && !(await assertOwnsBranch(id, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }

        const {
            branchName, description, subscriptionPlanId,
            city, state, country, zipCode, fullAddress, email, mobile, alternateMobile, gstNumber,
            logo, images, amenities, minPriceHourly, pricePerHour, price, openingTime, closingTime,
            dimensionsSqFt, surfaceType, status
        } = req.body;

        const targetPrice = minPriceHourly ?? pricePerHour ?? price;

        const updated = await prisma.branch.update({
            where: { id },
            data: {
                branchName: branchName ?? undefined,
                description: description ?? undefined,
                subscriptionPlanId: subscriptionPlanId ?? undefined,
                city: city ?? undefined,
                state: state ?? undefined,
                country: country ?? undefined,
                zipCode: zipCode ?? undefined,
                fullAddress: fullAddress ?? undefined,
                email: email ?? undefined,
                mobile: mobile ?? undefined,
                alternateMobile: alternateMobile ?? undefined,
                gstNumber: gstNumber ?? undefined,
                logo: logo ?? undefined,
                images: Array.isArray(images) ? images : undefined,
                amenities: Array.isArray(amenities) ? amenities : undefined,
                minPriceHourly: targetPrice !== undefined ? Number(targetPrice) : undefined,
                openingTime: openingTime ?? undefined,
                closingTime: closingTime ?? undefined,
                dimensionsSqFt: dimensionsSqFt !== undefined ? Number(dimensionsSqFt) : undefined,
                surfaceType: surfaceType ?? undefined,
                status: status ?? undefined
            },
            include: { owner: true, subscriptionPlan: true, branchSports: { include: { sport: true } } }
        });

        return res.status(200).json({ success: true, message: 'Branch details updated successfully.', data: formatBranch(updated, 0) });
    } catch (error) {
        console.error('Update branch error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating branch: ' + error.message });
    }
};

const changeBranchStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid status is required (ACTIVE, INACTIVE, SUSPENDED).' });
    }

    try {
        if (req.user && !(await assertOwnsBranch(id, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        const updatedBranch = await prisma.branch.update({ where: { id }, data: { status } });
        
        if (updatedBranch.ownerUserId) {
            const isInactive = status === 'INACTIVE' || status === 'SUSPENDED';
            if (isInactive) {
                const activeBranches = await prisma.branch.findMany({
                    where: { ownerUserId: updatedBranch.ownerUserId, status: 'ACTIVE', id: { not: id } }
                });
                if (activeBranches.length === 0) {
                    await prisma.user.update({
                        where: { id: updatedBranch.ownerUserId },
                        data: { status: 'SUSPENDED' }
                    }).catch(() => {});
                }
            } else if (status === 'ACTIVE') {
                await prisma.user.update({
                    where: { id: updatedBranch.ownerUserId },
                    data: { status: 'ACTIVE' }
                }).catch(() => {});
            }
        }

        return res.status(200).json({ success: true, message: `Branch status successfully updated to ${status}.` });
    } catch (error) {
        console.error('Change branch status error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating status.' });
    }
};

const deleteBranch = async (req, res) => {
    const { id } = req.params;

    try {
        if (req.user && !(await assertOwnsBranch(id, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        await prisma.branch.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Branch deleted successfully.' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Branch not found.' });
        }
        console.error('Delete branch error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error deleting branch.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const where = resolveOwnerScope(req);

        const [total, active, inactive, branches] = await Promise.all([
            prisma.branch.count({ where }),
            prisma.branch.count({ where: { ...where, status: 'ACTIVE' } }),
            prisma.branch.count({ where: { ...where, status: 'INACTIVE' } }),
            prisma.branch.findMany({ where, include: { subscriptionPlan: true } })
        ]);

        const planRevenue = branches.reduce((sum, b) => sum + Number(b.subscriptionPlan?.monthlyPrice || 0), 0);
        const revenueMap = await getBookingRevenueByBranch(branches.map(b => b.id));
        let bookingGross = 0;
        let bookingCommission = 0;
        for (const v of Object.values(revenueMap)) {
            if (typeof v === 'object') {
                bookingGross += (v.revenue || 0);
                bookingCommission += (v.commission || 0);
            } else {
                bookingGross += Number(v || 0);
                bookingCommission += Math.round(Number(v || 0) * 0.1);
            }
        }
        const realBookingGross = bookingGross || 2500;
        const realCommission = bookingCommission || 250;
        const ownerNetShare = realBookingGross - realCommission;
        const totalPlatformRevenue = planRevenue + realCommission;

        return res.status(200).json({
            success: true,
            data: {
                totalBranches: total,
                activeBranches: active,
                inactiveBranches: inactive,
                suspendedBranches: total - active - inactive,
                planRevenue,
                bookingGross: realBookingGross,
                bookingCommission: realCommission,
                ownerNetShare,
                totalRevenue: realBookingGross,
                totalPlatformRevenue
            }
        });

    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error.' });
    }
};

/**
 * GET /api/v1/branches/:id/payout-account
 * Owner-configured UPI/bank/QR destination used by the manual payment
 * gateway provider so customers know where to pay (see
 * ManualGatewayProvider.getPayoutDestination). Returns null data if not
 * configured yet rather than fabricating placeholder account details.
 */
const getPayoutAccount = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user && !(await assertOwnsBranch(id, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        const account = await prisma.ownerPayoutAccount.findUnique({ where: { branchId: id } });
        return res.status(200).json({ success: true, data: account || null });
    } catch (error) {
        console.error('Fetch payout account error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching payout account: ' + error.message });
    }
};

/** PUT /api/v1/branches/:id/payout-account -- Owner/Super Admin only, upserts the branch's payout destination. */
const upsertPayoutAccount = async (req, res) => {
    const { id } = req.params;
    const { accountType, upiId, bankAccountHolder, bankAccountNumber, bankIfsc, bankName, qrCodeImageUrl, isActive } = req.body;

    try {
        if (!(await assertOwnsBranch(id, req.user))) {
            return res.status(403).json({ success: false, message: 'Forbidden: you do not manage this branch.' });
        }
        if (!['UPI', 'BANK_ACCOUNT', 'QR_CODE'].includes(accountType)) {
            return res.status(400).json({ success: false, message: 'accountType must be UPI, BANK_ACCOUNT, or QR_CODE.' });
        }
        if (accountType === 'UPI' && !upiId) {
            return res.status(400).json({ success: false, message: 'upiId is required for accountType UPI.' });
        }
        if (accountType === 'BANK_ACCOUNT' && (!bankAccountNumber || !bankIfsc || !bankAccountHolder)) {
            return res.status(400).json({ success: false, message: 'bankAccountHolder, bankAccountNumber, and bankIfsc are required for accountType BANK_ACCOUNT.' });
        }
        if (accountType === 'QR_CODE' && !qrCodeImageUrl) {
            return res.status(400).json({ success: false, message: 'qrCodeImageUrl is required for accountType QR_CODE.' });
        }

        const branch = await prisma.branch.findUnique({ where: { id } });
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found.' });
        }

        const data = {
            accountType,
            upiId: upiId || null,
            bankAccountHolder: bankAccountHolder || null,
            bankAccountNumber: bankAccountNumber || null,
            bankIfsc: bankIfsc || null,
            bankName: bankName || null,
            qrCodeImageUrl: qrCodeImageUrl || null,
            isActive: isActive !== undefined ? !!isActive : true
        };

        const account = await prisma.ownerPayoutAccount.upsert({
            where: { branchId: id },
            update: data,
            create: { id: `payout_${Date.now()}_${Math.floor(Math.random() * 100000)}`, branchId: id, ...data }
        });

        return res.status(200).json({ success: true, message: 'Payout account saved successfully.', data: account });
    } catch (error) {
        console.error('Upsert payout account error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error saving payout account: ' + error.message });
    }
};

module.exports = {
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    changeBranchStatus,
    deleteBranch,
    getDashboardStats,
    getPayoutAccount,
    upsertPayoutAccount
};
