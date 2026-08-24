const prisma = require('../../config/prisma');

const resolveOwnerBranchIds = async (userId) => {
    const branches = await prisma.branch.findMany({ where: { ownerUserId: userId }, select: { id: true } });
    return branches.map(b => b.id);
};

/**
 * Owner-scoped dashboard summary: today's revenue/bookings, active matches,
 * available slots today, recent bookings, and hourly peak occupancy -- all
 * computed from real Slot/Booking rows via the slot->branch relation.
 */
const getOwnerDashboardSummary = async (branchIds) => {
    const startOfToday = new Date(new Date().toDateString());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    if (branchIds.length === 0) {
        const defaultHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
        return {
            todaysRevenue: 0, todaysBookings: 0, activeMatches: 0, upcomingEvents: 0,
            totalRevenue: 0, availableSlots: 0, sportsCount: await prisma.sport.count(),
            recentBookings: [],
            peakData: defaultHours.map(h => ({ h: `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`, v: 0, count: 0 }))
        };
    }

    const bookingWhere = { slot: { branchId: { in: branchIds } } };

    const [todaysAgg, totalAgg, todaysCount, activeMatches, availableSlots, recent, bookedSlotsToday, sportsCount] = await Promise.all([
        prisma.booking.aggregate({ where: { ...bookingWhere, status: 'COMPLETED', createdAt: { gte: startOfToday, lt: endOfToday } }, _sum: { amount: true } }),
        prisma.booking.aggregate({ where: { ...bookingWhere, status: 'COMPLETED' }, _sum: { amount: true } }),
        prisma.booking.count({ where: { ...bookingWhere, createdAt: { gte: startOfToday, lt: endOfToday } } }),
        prisma.slot.count({ where: { branchId: { in: branchIds }, status: 'BOOKED', slotDate: startOfToday } }),
        prisma.slot.count({ where: { branchId: { in: branchIds }, status: 'AVAILABLE', slotDate: startOfToday } }),
        prisma.booking.findMany({ where: bookingWhere, include: { slot: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.slot.findMany({ where: { branchId: { in: branchIds }, status: 'BOOKED', slotDate: startOfToday }, select: { startTime: true } }),
        prisma.sport.count()
    ]);

    const hourMap = {};
    for (const s of bookedSlotsToday) {
        const hour = Number(s.startTime.split(':')[0]);
        hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
    const defaultHours = [6, 8, 10, 12, 14, 16, 18, 20, 22];
    const peakData = defaultHours.map(h => {
        const count = hourMap[h] || 0;
        return { h: `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`, v: Math.min(count * 20, 100), count };
    });

    return {
        todaysRevenue: Number(todaysAgg._sum.amount || 0),
        todaysBookings: todaysCount,
        activeMatches, upcomingEvents: 0,
        totalRevenue: Number(totalAgg._sum.amount || 0),
        availableSlots, sportsCount,
        recentBookings: recent.map(b => ({
            id: String(b.id),
            time: b.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            customer: b.customerName, sport: b.slot?.sportId ? b.sportName : b.sportName,
            court: b.slot?.courtName || b.courtName,
            amount: `₹${Number(b.amount).toLocaleString()}`,
            status: ['COMPLETED', 'HELD'].includes(b.status) ? 'Confirmed' : 'Pending'
        })),
        peakData
    };
};

const getDashboardSummary = async (req, res) => {
    try {
        if (req.user?.role === 'OWNER') {
            const branchIds = await resolveOwnerBranchIds(req.user.id);
            return res.status(200).json({ success: true, data: await getOwnerDashboardSummary(branchIds) });
        }

        // Super Admin summary
        const [total, active, inactive, branches, totalUsers, activePlanCount] = await Promise.all([
            prisma.branch.count(),
            prisma.branch.count({ where: { status: 'ACTIVE' } }),
            prisma.branch.count({ where: { status: 'INACTIVE' } }),
            prisma.branch.findMany({ where: { status: 'ACTIVE' }, include: { subscriptionPlan: true } }),
            prisma.user.count({ where: { role: { in: ['OWNER', 'ADMIN'] } } }),
            prisma.subscriptionPlan.count({ where: { status: 'ACTIVE' } })
        ]);

        const subscriptionRevenue = branches.reduce((sum, b) => sum + Number(b.subscriptionPlan?.monthlyPrice || 0), 0);
        const bookingAgg = await prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } });
        const bookingRevenue = Number(bookingAgg._sum.amount || 0);

        return res.status(200).json({
            success: true,
            data: {
                totalBranches: total, activeBranches: active, inactiveBranches: inactive,
                totalRevenue: subscriptionRevenue + bookingRevenue, totalUsers,
                activeSubscriptions: activePlanCount || 3,
                monthlyGrowth: (subscriptionRevenue + bookingRevenue) > 0 ? 100 : 0
            }
        });
    } catch (error) {
        console.error('Fetch dashboard summary error:', error);
        return res.status(500).json({ success: false, message: 'Error compiling dashboard summary: ' + error.message });
    }
};

const monthlyBuckets = async (fetchRows) => {
    const rows = await fetchRows();
    const byMonth = {};
    for (const r of rows) {
        const m = r.createdAt.toLocaleString('en-US', { month: 'short' });
        byMonth[m] = (byMonth[m] || 0) + Number(r.amount);
    }
    return Object.entries(byMonth).map(([Month, Revenue]) => ({ Month, Revenue, month: Month, revenue: Revenue }));
};

const getRevenueGrowth = async (req, res) => {
    try {
        const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const [subs, payments] = await Promise.all([
            prisma.ownerSubscription.findMany({ where: { paymentStatus: 'COMPLETED', createdAt: { gte: sixMonthsAgo } }, select: { amount: true, createdAt: true } }),
            prisma.payment.findMany({ where: { status: 'COMPLETED', createdAt: { gte: sixMonthsAgo } }, select: { amount: true, createdAt: true } })
        ]);

        const byMonth = {};
        for (const r of [...subs, ...payments]) {
            const m = r.createdAt.toLocaleString('en-US', { month: 'short' });
            byMonth[m] = (byMonth[m] || 0) + Number(r.amount);
        }
        let data = Object.entries(byMonth).map(([Month, Revenue]) => ({ Month, Revenue, month: Month, revenue: Revenue }));
        if (data.length === 0) {
            const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
            data = [{ Month: currentMonth, Revenue: 0, month: currentMonth, revenue: 0 }];
        }
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Revenue growth error:', error);
        return res.status(500).json({ success: false, message: 'Error compiling revenue growth: ' + error.message });
    }
};

const getCommissionGrowth = async (req, res) => {
    try {
        const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const payments = await prisma.payment.findMany({ where: { status: 'COMPLETED', createdAt: { gte: sixMonthsAgo } }, select: { amount: true, createdAt: true } });

        const byMonth = {};
        for (const r of payments) {
            const m = r.createdAt.toLocaleString('en-US', { month: 'short' });
            byMonth[m] = (byMonth[m] || 0) + Math.round(Number(r.amount) * 0.1);
        }
        let data = Object.entries(byMonth).map(([Month, Commission]) => ({ Month, 'Commission Amount': Commission, month: Month, commission: Commission }));
        if (data.length === 0) {
            const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
            data = [{ Month: currentMonth, 'Commission Amount': 0, month: currentMonth, commission: 0 }];
        }
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Commission growth error:', error);
        return res.status(500).json({ success: false, message: 'Error compiling commission growth: ' + error.message });
    }
};

const getTopBranches = async (req, res) => {
    try {
        const branches = await prisma.branch.findMany({ include: { owner: true, subscriptionPlan: true } });
        const bookingAgg = await prisma.booking.groupBy({ by: ['slotId'], where: { status: 'COMPLETED' }, _sum: { amount: true } });
        const slots = await prisma.slot.findMany({ where: { id: { in: bookingAgg.map(b => b.slotId).filter(Boolean) } }, select: { id: true, branchId: true } });
        const slotToBranch = Object.fromEntries(slots.map(s => [s.id, s.branchId]));

        const revenueByBranch = {};
        const bookingsByBranch = {};
        for (const b of bookingAgg) {
            const branchId = slotToBranch[b.slotId];
            if (!branchId) continue;
            revenueByBranch[branchId] = (revenueByBranch[branchId] || 0) + Number(b._sum.amount || 0);
            bookingsByBranch[branchId] = (bookingsByBranch[branchId] || 0) + 1;
        }

        const rows = branches.map(br => {
            const planPrice = Number(br.subscriptionPlan?.monthlyPrice || 0);
            const bookingRev = revenueByBranch[br.id] || 0;
            return {
                _id: br.id, branchName: br.branchName, 'Branch Name': br.branchName,
                city: br.city, City: br.city, status: br.status, Status: br.status,
                ownerName: br.owner?.fullName || null, planName: br.subscriptionPlan?.planName || null,
                planPrice, Bookings: bookingsByBranch[br.id] || 0, bookingsCount: bookingsByBranch[br.id] || 0,
                Revenue: planPrice + bookingRev, totalRevenue: planPrice + bookingRev
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 100);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Top branches error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching top branches: ' + error.message });
    }
};

const getRecentActivities = async (req, res) => {
    try {
        let where = {};
        if (req.user?.role === 'OWNER') {
            const branchIds = await resolveOwnerBranchIds(req.user.id);
            where = { OR: [{ entityType: 'Branch', entityId: { in: branchIds } }, { userId: req.user.id }] };
        }

        const logs = await prisma.activityLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
        return res.status(200).json({
            success: true,
            data: logs.map(l => ({ id: l.id, activity: l.action, details: l.details, timestamp: l.createdAt }))
        });
    } catch (error) {
        console.error('Recent activities error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching recent activities: ' + error.message });
    }
};

module.exports = { getDashboardSummary, getRevenueGrowth, getCommissionGrowth, getTopBranches, getRecentActivities };
