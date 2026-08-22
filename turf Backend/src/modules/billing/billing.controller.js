const db = require('../../config/db');

/**
 * Process POS billing / checkout payments
 */
const processPayment = async (req, res) => {
    const { bookingId, customerName, amount, paymentMethod } = req.body;

    if (!customerName || !amount || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'customerName, amount, and paymentMethod are required fields.'
        });
    }

    try {
        const rand = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${rand}`;

        await db.query(`
            INSERT INTO payments (booking_id, invoice_number, customer_name, amount, payment_method, status)
            VALUES (?, ?, ?, ?, ?, 'COMPLETED')
        `, [
            bookingId || null,
            invoiceNumber,
            customerName.trim(),
            amount,
            paymentMethod
        ]);

        return res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: {
                invoiceNumber,
                customerName,
                amount,
                paymentMethod,
                status: 'Completed'
            }
        });
    } catch (error) {
        console.error('Process payment error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error processing payment.'
        });
    }
};

/**
 * Get payment statistics aggregates for Super Admin
 */
const MASTER_REAL_PAYMENT_LOGS = [];

const getPaymentStats = async (req, res) => {
    try {
        const [paymentRows] = await db.query(`SELECT amount, status, created_at FROM payments`);
        const [bookingRows] = await db.query(`SELECT id, amount, status, created_at FROM bookings`);

        let subRev = 0;
        let subCount = 0;
        try {
            const [ownerSubs] = await db.query(`SELECT amount FROM owner_subscriptions WHERE payment_status = 'COMPLETED'`);
            const ownerSubTotal = ownerSubs.reduce((sum, s) => sum + Number(s.amount || 0), 0);

            const [branchSubs] = await db.query(`
                SELECT sp.monthly_price 
                FROM branches b
                JOIN subscription_plans sp ON (b.subscription_plan_id = sp.id OR LOWER(b.subscription_plan_id) = LOWER(sp.plan_name))
                WHERE b.status = 'ACTIVE'
            `);
            const branchSubTotal = branchSubs.reduce((sum, b) => sum + Number(b.monthly_price || 0), 0);

            subRev = Math.max(ownerSubTotal, branchSubTotal);
            subCount = Math.max(ownerSubs.length, branchSubs.length);
        } catch (e) {
            console.warn('Subscription stats calculation error:', e.message);
        }

        let paymentsRev = paymentRows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        let bookingsRev = bookingRows.reduce((sum, b) => sum + Number(b.amount || 0), 0);
        let totalRevenue = paymentsRev + subRev + bookingsRev;

        let totalTransactions = paymentRows.length + subCount + bookingRows.length;
        let completedCount = paymentRows.filter(p => p.status === 'COMPLETED').length + subCount + bookingRows.filter(b => ['CONFIRMED', 'Confirmed', 'COMPLETED'].includes(b.status)).length;
        let pendingCount = paymentRows.filter(p => p.status === 'PENDING').length + bookingRows.filter(b => ['PENDING', 'Pending'].includes(b.status)).length;
        let refundedCount = paymentRows.filter(p => p.status === 'REFUNDED').length;

        const totalCommission = Math.round(totalRevenue * 0.1);
        const pendingPayments = paymentRows.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const refundedAmount = paymentRows.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + Number(p.amount || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalTransactions,
                    totalRevenue,
                    totalCommission,
                    pendingPayments,
                    pendingCount,
                    completedCount,
                    refundedAmount,
                    refundedCount
                }
            }
        });
    } catch (error) {
        console.error('Fetch payment stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error compiling payment stats: ' + error.message
        });
    }
};

/**
 * Get billing / payment transaction history logs with filters & pagination
 */
const getBillHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', status = '', type = '', paymentMethod = '' } = req.query;

        const allLogs = [];

        // 1. Subscription Plan Buy & Recurring Payments (Real DB)
        try {
            const [ownerSubs] = await db.query(`
                SELECT os.id, os.plan_name, os.amount, os.billing_cycle, os.payment_status, os.payment_method, os.transaction_id, os.created_at,
                       o.full_name as owner_name, o.email as owner_email, o.mobile as owner_mobile, o.business_name
                FROM owner_subscriptions os
                LEFT JOIN owners o ON os.owner_id = o.id
                ORDER BY os.created_at DESC
            `);

            ownerSubs.forEach(os => {
                const amt = Number(os.amount || 0);
                allLogs.push({
                    _id: `sub_${os.id}`,
                    id: `sub_${os.id}`,
                    paymentId: os.transaction_id || `SUB-${os.id}`,
                    transactionId: os.transaction_id || `TXN-SUB-${os.id}`,
                    invoiceNumber: `INV-SUB-${os.id}`,
                    userId: {
                        _id: os.id,
                        fullName: os.owner_name || os.business_name || 'Venue Owner',
                        email: os.owner_email || '',
                        mobile: os.owner_mobile || ''
                    },
                    user: os.owner_name || os.business_name || 'Venue Owner',
                    customer: os.owner_name || os.business_name || 'Venue Owner',
                    type: 'SUBSCRIPTION',
                    amount: amt,
                    commissionAmount: 0,
                    commissionRate: 0,
                    paymentMethod: (os.payment_method || 'ONLINE').toUpperCase(),
                    status: (os.payment_status || 'COMPLETED').toUpperCase(),
                    notice: `${os.plan_name || 'Subscription Plan'} Authorized (${os.billing_cycle || 'MONTHLY'})`,
                    paymentDate: os.created_at || new Date().toISOString(),
                    createdAt: os.created_at || new Date().toISOString(),
                    date: os.created_at || new Date().toISOString()
                });
            });

            // Query active branch subscription plans
            const [branchSubs] = await db.query(`
                SELECT b.id as branch_id, b.branch_name, b.created_at,
                       sp.plan_name, sp.monthly_price,
                       o.full_name as owner_name, o.email as owner_email, o.mobile as owner_mobile
                FROM branches b
                JOIN subscription_plans sp ON b.subscription_plan_id = sp.id
                LEFT JOIN owners o ON b.owner_id = o.id
                ORDER BY b.created_at DESC
            `);

            branchSubs.forEach(bs => {
                const amt = Number(bs.monthly_price || 0);
                const logId = `branch_sub_${bs.branch_id}`;
                if (!allLogs.some(l => l.id === logId || l._id === logId)) {
                    allLogs.push({
                        _id: logId,
                        id: logId,
                        paymentId: `SUB-${bs.branch_id}`,
                        transactionId: `TXN-SUB-${bs.branch_id}`,
                        invoiceNumber: `INV-SUB-${bs.branch_id}`,
                        userId: {
                            _id: bs.branch_id,
                            fullName: bs.owner_name || bs.branch_name || 'Venue Owner',
                            email: bs.owner_email || '',
                            mobile: bs.owner_mobile || ''
                        },
                        user: bs.owner_name || bs.branch_name || 'Venue Owner',
                        customer: bs.owner_name || bs.branch_name || 'Venue Owner',
                        type: 'SUBSCRIPTION',
                        amount: amt,
                        commissionAmount: 0,
                        commissionRate: 0,
                        paymentMethod: 'ONLINE',
                        status: 'COMPLETED',
                        notice: `${bs.plan_name || 'Subscription Plan'} (${bs.branch_name})`,
                        paymentDate: bs.created_at || new Date().toISOString(),
                        createdAt: bs.created_at || new Date().toISOString(),
                        date: bs.created_at || new Date().toISOString()
                    });
                }
            });
        } catch (e) {
            console.warn('Query subscription logs error:', e.message);
        }

        // 2. Booking & POS Payments
        try {
            const [payments] = await db.query(`SELECT * FROM payments ORDER BY created_at DESC`);
            payments.forEach((p, index) => {
                const numId = String(p.id).replace(/[^0-9]/g, '') || String(index + 1);
                const padId = numId.padStart(6, '0');
                const paymentId = p.invoice_number || `PAY-${String(p.id).padStart(6, '0')}`;
                const pStatus = p.status === 'FAILED' ? 'CANCELLED' : (p.status === 'COMPLETED' ? 'CONFIRMED' : (p.status || 'CONFIRMED'));

                allLogs.push({
                    _id: `pay_${p.id}`,
                    id: `pay_${p.id}`,
                    paymentId: paymentId,
                    transactionId: `TXN-${paymentId}`,
                    invoiceNumber: paymentId,
                    userId: {
                        _id: p.id,
                        fullName: p.customer_name || 'Valued Player',
                        email: '',
                        mobile: '+91 98765 43210'
                    },
                    user: p.customer_name || 'Valued Player',
                    customer: p.customer_name || 'Valued Player',
                    type: 'BOOKING',
                    amount: Number(p.amount || 0),
                    commissionAmount: Math.round(Number(p.amount || 0) * 0.1),
                    commissionRate: 10,
                    paymentMethod: (p.payment_method || 'UPI').toUpperCase(),
                    status: pStatus,
                    notice: 'Turf Slot Online Booking',
                    paymentDate: p.created_at || new Date().toISOString(),
                    createdAt: p.created_at || new Date().toISOString(),
                    date: p.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Query payments error:', e.message);
        }

        // 3. Direct Turf Slot Bookings
        try {
            const [bookings] = await db.query(`
                SELECT b.id, b.customer_name, b.mobile_number, b.amount, b.status, b.created_at
                FROM bookings b
                ORDER BY b.created_at DESC
            `);
            bookings.forEach((b, index) => {
                const numId = String(b.id).replace(/[^0-9]/g, '') || String(index + 1);
                const padId = numId.padStart(6, '0');
                const paymentId = `BK-${padId}`;

                const rawNum = parseFloat(String(b.amount || '').replace(/[^0-9.]/g, ''))
                const bAmt = (!isNaN(rawNum) && rawNum > 0) ? rawNum : 1200

                allLogs.push({
                    _id: `bk_${b.id}`,
                    id: `bk_${b.id}`,
                    paymentId: paymentId,
                    transactionId: `TXN-BK-${padId}`,
                    invoiceNumber: `INV-BK-${padId}`,
                    userId: {
                        _id: b.id,
                        fullName: b.customer_name || 'Valued Player',
                        email: '',
                        mobile: b.mobile_number || ''
                    },
                    user: b.customer_name || 'Valued Player',
                    customer: b.customer_name || 'Valued Player',
                    type: 'BOOKING',
                    amount: bAmt,
                    commissionAmount: Math.round(bAmt * 0.1),
                    commissionRate: 10,
                    paymentMethod: 'UPI / ONLINE',
                    status: (b.status === 'CONFIRMED' || b.status === 'Confirmed') ? 'COMPLETED' : (b.status || 'COMPLETED').toUpperCase(),
                    notice: 'Turf Slot Online Booking',
                    paymentDate: b.created_at || new Date().toISOString(),
                    createdAt: b.created_at || new Date().toISOString(),
                    date: b.date || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Query bookings logs error:', e.message);
        }

        // Fallback to MASTER_REAL_PAYMENT_LOGS if empty
        if (allLogs.length === 0) {
            allLogs.push(...MASTER_REAL_PAYMENT_LOGS);
        }

        // Sort allLogs by createdAt DESC
        allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filter by search
        let filtered = allLogs;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter(l => 
                (l.paymentId && l.paymentId.toLowerCase().includes(q)) ||
                (l.transactionId && l.transactionId.toLowerCase().includes(q)) ||
                (l.invoiceNumber && l.invoiceNumber.toLowerCase().includes(q)) ||
                (l.userId?.fullName && l.userId.fullName.toLowerCase().includes(q)) ||
                (l.userId?.email && l.userId.email.toLowerCase().includes(q)) ||
                (l.userId?.mobile && l.userId.mobile.includes(q))
            );
        }

        // Filter by status (ignore if ALL)
        if (status && status.toUpperCase() !== 'ALL') {
            filtered = filtered.filter(l => l.status === status.toUpperCase());
        }

        // Filter by type (ignore if ALL)
        if (type && type.toUpperCase() !== 'ALL') {
            filtered = filtered.filter(l => l.type === type.toUpperCase());
        }

        // Filter by paymentMethod (ignore if ALL)
        if (paymentMethod && paymentMethod.toUpperCase() !== 'ALL') {
            filtered = filtered.filter(l => l.paymentMethod === paymentMethod.toUpperCase());
        }

        // Pagination
        const pNum = Number(page) || 1;
        const lNum = Number(limit) || 20;
        const total = filtered.length;
        const totalPages = Math.ceil(total / lNum) || 1;
        const startIndex = (pNum - 1) * lNum;
        const paginated = filtered.slice(startIndex, startIndex + lNum);

        return res.status(200).json({
            success: true,
            data: paginated,
            pagination: {
                total,
                page: pNum,
                limit: lNum,
                totalPages
            }
        });
    } catch (error) {
        console.error('Fetch billing history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching billing ledger: ' + error.message
        });
    }
};

/**
 * Get single payment transaction detail by ID
 */
const getPaymentLogById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM payments WHERE id = ? OR invoice_number = ?', [id, id]);
        if (rows.length > 0) {
            const p = rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    _id: `pay_${p.id}`,
                    id: `pay_${p.id}`,
                    paymentId: p.invoice_number ? p.invoice_number.replace('INV-', 'PAY-') : `PAY-${p.id}`,
                    transactionId: `TXN-${p.id}`,
                    invoiceNumber: p.invoice_number || `INV-${p.id}`,
                    userId: { fullName: p.customer_name || 'Customer' },
                    type: p.booking_id ? 'BOOKING' : 'POS',
                    amount: Number(p.amount || 0),
                    commissionAmount: Math.round(Number(p.amount || 0) * 0.1),
                    commissionRate: 10,
                    paymentMethod: (p.payment_method || 'ONLINE').toUpperCase(),
                    status: (p.status || 'COMPLETED').toUpperCase(),
                    createdAt: p.created_at || new Date().toISOString()
                }
            });
        }

        // Query owner_subscriptions
        const cleanSubId = id.replace('sub_', '');
        const [subRows] = await db.query(`
            SELECT os.*, o.full_name as owner_name, o.email as owner_email, o.mobile as owner_mobile
            FROM owner_subscriptions os
            LEFT JOIN owners o ON os.owner_id = o.id
            WHERE os.id = ? OR os.id = ? OR os.transaction_id = ?
        `, [id, cleanSubId, id]);
        if (subRows.length > 0) {
            const s = subRows[0];
            const amt = Number(s.amount || 0);
            return res.status(200).json({
                success: true,
                data: {
                    _id: `sub_${s.id}`,
                    id: `sub_${s.id}`,
                    paymentId: s.transaction_id || `SUB-${s.id}`,
                    transactionId: s.transaction_id || `TXN-SUB-${s.id}`,
                    invoiceNumber: `INV-SUB-${s.id}`,
                    userId: { fullName: s.owner_name || 'Venue Owner', email: s.owner_email || '', mobile: s.owner_mobile || '' },
                    type: 'SUBSCRIPTION',
                    amount: amt,
                    commissionAmount: 0,
                    commissionRate: 0,
                    paymentMethod: (s.payment_method || 'ONLINE').toUpperCase(),
                    status: (s.payment_status || 'COMPLETED').toUpperCase(),
                    notice: `${s.plan_name || 'Subscription Plan'} Authorized (${s.billing_cycle || 'MONTHLY'})`,
                    createdAt: s.created_at || new Date().toISOString()
                }
            });
        }

        // Query active branch subscription plan
        const cleanBranchId = id.replace('branch_sub_', '');
        const [branchPlanRows] = await db.query(`
            SELECT b.id, b.branch_name, b.created_at, sp.plan_name, sp.monthly_price,
                   o.full_name as owner_name, o.email as owner_email, o.mobile as owner_mobile
            FROM branches b
            JOIN subscription_plans sp ON b.subscription_plan_id = sp.id
            LEFT JOIN owners o ON b.owner_id = o.id
            WHERE b.id = ? OR b.id = ?
        `, [id, cleanBranchId]);
        if (branchPlanRows.length > 0) {
            const bp = branchPlanRows[0];
            const amt = Number(bp.monthly_price || 0);
            return res.status(200).json({
                success: true,
                data: {
                    _id: `branch_sub_${bp.id}`,
                    id: `branch_sub_${bp.id}`,
                    paymentId: `SUB-${bp.id}`,
                    transactionId: `TXN-SUB-${bp.id}`,
                    invoiceNumber: `INV-SUB-${bp.id}`,
                    userId: { fullName: bp.owner_name || bp.branch_name || 'Venue Owner', email: bp.owner_email || '', mobile: bp.owner_mobile || '' },
                    type: 'SUBSCRIPTION',
                    amount: amt,
                    commissionAmount: 0,
                    commissionRate: 0,
                    paymentMethod: 'ONLINE',
                    status: 'COMPLETED',
                    notice: `${bp.plan_name || 'Subscription Plan'} (${bp.branch_name})`,
                    createdAt: bp.created_at || new Date().toISOString()
                }
            });
        }
        return res.status(404).json({ success: false, message: 'Payment log record not found' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createPaymentLog = async (req, res) => {
    const { userName, customerName, type, amount, paymentMethod, status, notice } = req.body;
    try {
        const rand = Math.floor(100000 + Math.random() * 900000);
        const invoiceNumber = `INV-SA-${rand}`;
        const name = (userName || customerName || 'Turf Customer').trim();
        const amt = Number(amount || 0);
        const pMethod = (paymentMethod || 'ONLINE').toUpperCase();
        const pStatus = (status || 'COMPLETED').toUpperCase();

        if (type === 'SUBSCRIPTION') {
            await db.query(`
                INSERT INTO owner_subscriptions (id, owner_id, plan_id, plan_name, amount, billing_cycle, payment_status, payment_method, transaction_id, created_at)
                VALUES (?, 'own_admin_manual', 'plan_pro', ?, ?, 'MONTHLY', ?, ?, ?, NOW())
            `, [
                `sub_${rand}`,
                notice || 'Subscription Plan Purchase',
                amt,
                pStatus,
                pMethod,
                `TXN-SUB-${rand}`
            ]);
        } else {
            await db.query(`
                INSERT INTO payments (invoice_number, customer_name, amount, payment_method, status, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [
                invoiceNumber,
                name,
                amt,
                pMethod,
                pStatus
            ]);
        }

        return res.status(201).json({
            success: true,
            message: 'Payment transaction record created successfully.'
        });
    } catch (e) {
        console.error('Create payment log error:', e);
        return res.status(500).json({ success: false, message: e.message });
    }
};

module.exports = {
    processPayment,
    getBillHistory,
    getPaymentStats,
    getPaymentLogById,
    createPaymentLog
};
