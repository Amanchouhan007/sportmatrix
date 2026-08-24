const prisma = require('../../config/prisma');
const { resolveOrCreateSlot } = require('../../services/slotResolution.service');
const MatchSettlementService = require('../../services/matchSettlement.service');
const { emitToBranch, emitToUser, emitToSuperAdmins } = require('../../realtime/socket');

const genInvoice = () => `INV-${Date.now().toString().substring(5)}`;
const genBookingCode = () => `BK-${Date.now().toString().slice(-8)}`;

const formatBooking = (b) => ({
    booking_id: b.id,
    id: b.id,
    bookingCode: b.bookingCode,
    user_id: b.userId,
    customer_name: b.customerName,
    mobile_number: b.mobileNumber,
    amount: Number(b.amount),
    duration: b.duration,
    booking_status: b.status,
    status: b.status,
    booked_on: b.createdAt,
    branch_id: b.slot?.branchId || null,
    slot_date: b.slot?.slotDate || b.dutyDate,
    start_time: b.slot?.startTime || b.timeSlot,
    end_time: b.slot?.endTime || null,
    court_name: b.slot?.courtName || b.courtName,
    sport_name: b.slot?.sport?.name || b.sportName,
    sport_icon: b.slot?.sport?.icon || null,
    checkInStatus: b.checkInStatus,
    notes: b.notes || ''
});

/**
 * Create a real slot booking. Accepts either an already-resolved slotId, or
 * enough detail (branchId/sportId/courtName/slotDate/startTime/endTime) to
 * resolve-or-create the real slot atomically.
 */
const createBooking = async (req, res) => {
    const { slotId, branchId, sportId, courtName, slotDate, startTime, endTime, customerName, mobileNumber, notes, paymentMethod } = req.body;
    const resolvedPaymentMethod = ['UPI', 'CASH', 'CARD', 'WALLET', 'BANK_TRANSFER', 'ONLINE'].includes((paymentMethod || '').toUpperCase())
        ? paymentMethod.toUpperCase() : 'UPI';

    if (!customerName || !mobileNumber) {
        return res.status(400).json({ success: false, message: 'customerName and mobileNumber are required fields.' });
    }
    if (!slotId && !(branchId && sportId && courtName && slotDate && startTime && endTime)) {
        return res.status(400).json({ success: false, message: 'Provide either slotId, or branchId/sportId/courtName/slotDate/startTime/endTime.' });
    }

    try {
        let slot;
        if (slotId) {
            slot = await prisma.slot.findUnique({ where: { id: slotId } });
            if (!slot) {
                return res.status(404).json({ success: false, message: 'Target slot configuration not found.' });
            }
            if (slot.status !== 'AVAILABLE') {
                return res.status(409).json({ success: false, message: `This slot is no longer available (current status: ${slot.status}).` });
            }
        } else {
            const resolved = await resolveOrCreateSlot({ branchId, sportId, courtName, slotDate, startTime, endTime });
            if (!resolved.ok) return res.status(resolved.code).json({ success: false, message: resolved.message });
            slot = resolved.slot;
        }

        const amount = slot.isPeakHour ? Number(slot.peakPrice) : Number(slot.regularPrice);
        const bookingUserId = req.user ? req.user.id : null;

        const result = await prisma.$transaction(async (tx) => {
            const bookedSlot = await tx.slot.update({ where: { id: slot.id, status: 'AVAILABLE' }, data: { status: 'BOOKED' } }).catch(() => null);
            if (!bookedSlot) throw Object.assign(new Error('Slot was just booked by someone else.'), { code: 'RACE' });

            const booking = await tx.booking.create({
                data: {
                    bookingCode: genBookingCode(),
                    slotId: slot.id,
                    userId: bookingUserId,
                    customerName: customerName.trim(),
                    mobileNumber: mobileNumber.trim(),
                    amount,
                    duration: slot.duration,
                    notes: (notes || '').trim(),
                    status: 'COMPLETED'
                }
            });

            await tx.payment.create({
                data: {
                    bookingId: booking.id,
                    userId: bookingUserId,
                    invoiceNumber: genInvoice(),
                    customerName: customerName.trim(),
                    type: 'Booking',
                    amount,
                    paymentMethod: resolvedPaymentMethod,
                    status: 'COMPLETED'
                }
            });

            return booking;
        });

        emitToBranch(slot.branchId, 'booking:new', { bookingId: result.id, bookingCode: result.bookingCode, amount });
        if (bookingUserId) emitToUser(bookingUserId, 'booking:new', { bookingId: result.id, bookingCode: result.bookingCode });
        emitToSuperAdmins('booking:new', { bookingId: result.id, bookingCode: result.bookingCode, amount });

        return res.status(201).json({
            success: true,
            message: 'Booking successfully registered',
            data: { bookingId: result.id, bookingCode: result.bookingCode, slotId: slot.id, amount, duration: slot.duration, customerName, mobileNumber }
        });
    } catch (error) {
        if (error.code === 'RACE') {
            return res.status(409).json({ success: false, message: error.message });
        }
        console.error('Create booking transaction error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error placing booking.' });
    }
};

/**
 * Cancel a booking. Payment status moves to REFUNDED and, if the customer has
 * an account, the amount is credited back to their real Wallet.
 */
const cancelBooking = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking record not found.' });
        }
        if (booking.status === 'REFUNDED') {
            return res.status(400).json({ success: false, message: 'This booking is already cancelled/refunded.' });
        }

        let branchId = null;
        await prisma.$transaction(async (tx) => {
            await tx.booking.update({ where: { id }, data: { status: 'REFUNDED' } });
            if (booking.slotId) {
                const slot = await tx.slot.update({ where: { id: booking.slotId }, data: { status: 'AVAILABLE' } });
                branchId = slot.branchId;
            }
            if (booking.userId) {
                await MatchSettlementService.postWalletTransaction(tx, {
                    userId: booking.userId,
                    type: 'REFUND',
                    description: `Refund for cancelled booking #${booking.bookingCode || booking.id}`,
                    amount: Number(booking.amount)
                });
            }
        });

        emitToBranch(branchId, 'booking:cancelled', { bookingId: id });
        if (booking.userId) emitToUser(booking.userId, 'booking:cancelled', { bookingId: id });
        emitToSuperAdmins('booking:cancelled', { bookingId: id });

        return res.status(200).json({ success: true, message: 'Booking successfully cancelled, slot is now available.' });
    } catch (error) {
        console.error('Cancel booking transaction error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error cancelling booking.' });
    }
};

/**
 * STAFF and OWNER are scoped differently: an Owner's branches are found via
 * Branch.ownerUserId, but a Staff member's own id never matches that -- their
 * assigned branch lives on User.staffBranchId instead. Resolves the real
 * branch-scoping filter for either role rather than silently returning zero
 * rows for staff accounts.
 */
const resolveBranchFilterForUser = async (req, branchId) => {
    if (req.user.role === 'STAFF') {
        const staffUser = await prisma.user.findUnique({ where: { id: req.user.id }, select: { staffBranchId: true } });
        return staffUser?.staffBranchId ? { branchId: staffUser.staffBranchId } : { branchId: '__none__' };
    }
    return branchId ? { branchId } : { branch: { ownerUserId: req.user.id } };
};

const getUpcomingBookings = async (req, res) => {
    const { branchId } = req.query;
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    try {
        const where = { status: { in: ['COMPLETED', 'HELD'] }, slot: { slotDate: { gte: new Date(new Date().toDateString()) } } };

        if (req.user.role === 'CUSTOMER') {
            where.userId = req.user.id;
        } else if (req.user.role === 'OWNER' || req.user.role === 'STAFF') {
            where.slot = { ...where.slot, ...(await resolveBranchFilterForUser(req, branchId)) };
        } else if (branchId) {
            where.slot = { ...where.slot, branchId };
        }

        const rows = await prisma.booking.findMany({
            where,
            include: { slot: { include: { sport: true } } },
            orderBy: [{ slot: { slotDate: 'asc' } }]
        });

        return res.status(200).json({ success: true, data: rows.map(formatBooking) });
    } catch (error) {
        console.error('Fetch upcoming bookings error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching upcoming bookings.' });
    }
};

const getBookingHistory = async (req, res) => {
    const { branchId } = req.query;
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    try {
        const where = {};

        if (req.user.role === 'CUSTOMER') {
            where.userId = req.user.id;
        } else if (req.user.role === 'OWNER' || req.user.role === 'STAFF') {
            where.slot = await resolveBranchFilterForUser(req, branchId);
        } else if (branchId) {
            where.slot = { branchId };
        }

        const rows = await prisma.booking.findMany({
            where,
            include: { slot: { include: { sport: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: rows.map(formatBooking) });
    } catch (error) {
        console.error('Fetch booking history error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching booking history.' });
    }
};

const getBookingLedgerSummary = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.toDateString());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayCount, weekCount, monthCount, revenue] = await Promise.all([
            prisma.booking.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.booking.count({ where: { createdAt: { gte: startOfWeek } } }),
            prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.booking.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                todayCount,
                weekCount,
                monthCount,
                totalRevenue: Number(revenue._sum.amount || 0)
            }
        });
    } catch (error) {
        console.error('Fetch booking ledger summary error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching booking summary.' });
    }
};

/**
 * Update a booking's payment/lifecycle status. Booking.status is a PaymentStatus
 * value (PENDING/COMPLETED/HELD/FAILED/REFUND_PENDING/REFUNDED) -- there is no
 * separate CONFIRMED/CANCELLED enum on this model.
 */
const updateBookingStatus = async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const upperStatus = (status || '').toUpperCase();
    if (!['PENDING', 'COMPLETED', 'HELD', 'FAILED', 'REFUND_PENDING', 'REFUNDED'].includes(upperStatus)) {
        return res.status(400).json({ success: false, message: 'status must be one of PENDING, COMPLETED, HELD, FAILED, REFUND_PENDING, REFUNDED.' });
    }

    try {
        const booking = await prisma.booking.update({ where: { id }, data: { status: upperStatus } }).catch(() => null);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking.slotId) {
            const slotStatus = ['REFUNDED', 'FAILED', 'REFUND_PENDING'].includes(upperStatus) ? 'AVAILABLE' : 'BOOKED';
            await prisma.slot.update({ where: { id: booking.slotId }, data: { status: slotStatus } });
        }

        return res.status(200).json({ success: true, message: `Booking ${id} status updated to ${upperStatus}` });
    } catch (error) {
        console.error('Update booking status error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error updating booking status.' });
    }
};

/**
 * Guest booking creation -- still requires a real branch/sport/court/slot, just
 * without a logged-in session. No fabricated venue name or price is ever used.
 */
const createGuestBooking = async (req, res) => {
    const { branchId, sportId, courtName, slotDate, startTime, endTime, customerName, phone, notes } = req.body;

    if (!customerName || !phone) {
        return res.status(400).json({ success: false, message: 'customerName and phone are required.' });
    }
    if (!branchId || !sportId || !courtName || !slotDate || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: 'branchId, sportId, courtName, slotDate, startTime, and endTime are required.' });
    }

    try {
        const resolved = await resolveOrCreateSlot({ branchId, sportId, courtName, slotDate, startTime, endTime });
        if (!resolved.ok) return res.status(resolved.code).json({ success: false, message: resolved.message });
        const slot = resolved.slot;
        const amount = slot.isPeakHour ? Number(slot.peakPrice) : Number(slot.regularPrice);

        const booking = await prisma.$transaction(async (tx) => {
            const bookedSlot = await tx.slot.update({ where: { id: slot.id, status: 'AVAILABLE' }, data: { status: 'BOOKED' } }).catch(() => null);
            if (!bookedSlot) throw Object.assign(new Error('Slot was just booked by someone else.'), { code: 'RACE' });

            return tx.booking.create({
                data: {
                    bookingCode: genBookingCode(),
                    slotId: slot.id,
                    customerName: customerName.trim(),
                    mobileNumber: phone.trim(),
                    amount,
                    duration: slot.duration,
                    notes: (notes || '').trim(),
                    status: 'COMPLETED'
                }
            });
        });

        return res.status(201).json({
            success: true,
            message: 'Guest booking created successfully',
            data: { id: booking.bookingCode, bookingId: booking.id, customerName: customerName.trim(), phone: phone.trim(), slotDate, slotTime: startTime, amount, status: 'COMPLETED' }
        });
    } catch (error) {
        if (error.code === 'RACE') {
            return res.status(409).json({ success: false, message: error.message });
        }
        console.error('Guest booking error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create guest booking: ' + error.message });
    }
};

const lookupGuestBookingsByPhone = async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number query parameter is required.' });
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

        const bookings = await prisma.booking.findMany({
            where: { mobileNumber: { contains: cleanPhone } },
            include: { slot: { include: { branch: true, sport: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings.map(b => ({
                id: b.bookingCode || `BK-${b.id}`,
                bookingId: b.id,
                customerName: b.customerName,
                phone: b.mobileNumber,
                amount: Number(b.amount),
                duration: b.duration,
                status: b.status,
                turfName: b.slot?.branch?.branchName || null,
                slotDate: b.slot?.slotDate || null,
                slotTime: b.slot?.startTime || null,
                createdAt: b.createdAt
            }))
        });
    } catch (error) {
        console.error('Lookup guest bookings error:', error);
        return res.status(500).json({ success: false, message: 'Failed to lookup guest bookings: ' + error.message });
    }
};

module.exports = {
    createBooking,
    cancelBooking,
    getUpcomingBookings,
    getBookingHistory,
    getBookingLedgerSummary,
    updateBookingStatus,
    createGuestBooking,
    lookupGuestBookingsByPhone
};
