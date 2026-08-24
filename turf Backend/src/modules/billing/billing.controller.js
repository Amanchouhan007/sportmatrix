const prisma = require('../../config/prisma');
const { computeSplit } = require('../../services/paymentGateway/paymentSplit.util');

/**
 * POS / checkout payment recording. Uses the real Payment model as the single
 * unified transaction ledger (bookings, subscriptions, and admin-entered logs
 * all live here via the `type` field) -- no synthetic fallback names or amounts.
 * These are staff/owner-recorded at the venue (cash/card in hand), so the
 * owner leg is inherently confirmed at entry time; the commission leg is left
 * PENDING for Super Admin reconciliation via PaymentLogs, same as online
 * match-payment commission legs.
 */
const processPayment = async (req, res) => {
    const { bookingId, customerName, amount, paymentMethod } = req.body;
    if (!customerName || !amount || !paymentMethod) {
        return res.status(400).json({ success: false, message: 'customerName, amount, and paymentMethod are required fields.' });
    }

    try {
        const split = await computeSplit(amount);
        const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const payment = await prisma.payment.create({
            data: {
                bookingId: bookingId ? Number(bookingId) : null,
                userId: req.user?.id || null,
                invoiceNumber, customerName: customerName.trim(), amount,
                commission: split.commissionAmount, ownerAmount: split.ownerAmount,
                ownerPayoutStatus: 'CONFIRMED',
                paymentMethod: paymentMethod.toUpperCase(), status: 'COMPLETED'
            }
        });

        return res.status(201).json({ success: true, message: 'Payment processed successfully', data: { invoiceNumber: payment.invoiceNumber, customerName, amount, paymentMethod, status: 'Completed' } });
    } catch (error) {
        console.error('Process payment error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error processing payment.' });
    }
};

const getPaymentStats = async (req, res) => {
    try {
        const [payments, subAgg] = await Promise.all([
            prisma.payment.findMany({ select: { amount: true, status: true } }),
            prisma.branch.findMany({ where: { status: 'ACTIVE' }, include: { subscriptionPlan: true } })
        ]);

        const subRev = subAgg.reduce((sum, b) => sum + Number(b.subscriptionPlan?.monthlyPrice || 0), 0);
        const paymentsRev = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalRevenue = paymentsRev + subRev;

        const completedCount = payments.filter(p => p.status === 'COMPLETED').length + subAgg.length;
        const pendingCount = payments.filter(p => p.status === 'PENDING').length;
        const refundedCount = payments.filter(p => p.status === 'REFUNDED').length;
        const pendingPayments = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0);
        const refundedAmount = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + Number(p.amount), 0);

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalTransactions: payments.length + subAgg.length,
                    totalRevenue, totalCommission: Math.round(totalRevenue * 0.1),
                    pendingPayments, pendingCount, completedCount, refundedAmount, refundedCount
                }
            }
        });
    } catch (error) {
        console.error('Fetch payment stats error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error compiling payment stats: ' + error.message });
    }
};

const formatPaymentLog = (p) => ({
    _id: `pay_${p.id}`, id: `pay_${p.id}`,
    paymentId: p.invoiceNumber, transactionId: `TXN-${p.invoiceNumber}`, invoiceNumber: p.invoiceNumber,
    userId: { _id: p.userId, fullName: p.user?.name || p.customerName, email: p.user?.email || '', mobile: p.user?.mobile || '' },
    user: p.user?.name || p.customerName, customer: p.user?.name || p.customerName,
    type: p.type.toUpperCase(), amount: Number(p.amount),
    commissionAmount: Number(p.commission),
    commissionRate: Number(p.amount) > 0 ? Math.round((Number(p.commission) / Number(p.amount)) * 100) : 0,
    ownerAmount: Number(p.ownerAmount),
    ownerPayoutStatus: p.ownerPayoutStatus, commissionStatus: p.commissionStatus,
    paymentMethod: p.paymentMethod, status: p.status,
    notice: p.type === 'Booking' ? 'Turf Slot Online Booking' : p.type,
    paymentDate: p.createdAt, createdAt: p.createdAt, date: p.createdAt
});

const getBillHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = '', type = '', paymentMethod = '' } = req.query;

        const where = {};
        if (status && status.toUpperCase() !== 'ALL') where.status = status.toUpperCase();
        if (type && type.toUpperCase() !== 'ALL') where.type = type;
        if (paymentMethod && paymentMethod.toUpperCase() !== 'ALL') where.paymentMethod = paymentMethod.toUpperCase();
        if (search.trim()) {
            where.OR = [
                { invoiceNumber: { contains: search } },
                { customerName: { contains: search } }
            ];
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 20;

        const [total, rows] = await Promise.all([
            prisma.payment.count({ where }),
            prisma.payment.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * limitNum, take: limitNum })
        ]);

        return res.status(200).json({
            success: true,
            data: rows.map(formatPaymentLog),
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 }
        });
    } catch (error) {
        console.error('Fetch billing history error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error fetching billing ledger: ' + error.message });
    }
};

const getPaymentLogById = async (req, res) => {
    try {
        const rawId = req.params.id.replace('pay_', '');
        const payment = await prisma.payment.findFirst({
            where: { OR: [{ id: Number(rawId) || -1 }, { invoiceNumber: req.params.id }] },
            include: { user: true }
        });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment log record not found' });
        }
        return res.status(200).json({ success: true, data: formatPaymentLog(payment) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/** Super Admin manual ledger entry -- persisted directly as a real Payment row. */
const createPaymentLog = async (req, res) => {
    const { userName, customerName, type = 'Booking', amount, paymentMethod, status } = req.body;
    const name = (userName || customerName || '').trim();
    if (!name || !amount) {
        return res.status(400).json({ success: false, message: 'customerName and amount are required.' });
    }

    try {
        const split = await computeSplit(amount);
        const invoiceNumber = `INV-SA-${Math.floor(100000 + Math.random() * 900000)}`;
        const payment = await prisma.payment.create({
            data: {
                invoiceNumber, customerName: name, type,
                amount: Number(amount), commission: split.commissionAmount, ownerAmount: split.ownerAmount,
                ownerPayoutStatus: 'CONFIRMED',
                paymentMethod: (paymentMethod || 'ONLINE').toUpperCase(),
                status: (status || 'COMPLETED').toUpperCase()
            }
        });
        return res.status(201).json({ success: true, message: 'Payment transaction record created successfully.', data: formatPaymentLog(payment) });
    } catch (error) {
        console.error('Create payment log error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { processPayment, getBillHistory, getPaymentStats, getPaymentLogById, createPaymentLog };
