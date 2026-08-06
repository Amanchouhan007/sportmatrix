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
const getPaymentStats = async (req, res) => {
    try {
        const [paymentRows] = await db.query(`SELECT amount, status, created_at FROM payments`);
        const [ownerRows] = await db.query(`SELECT id, full_name, created_at FROM owners`);

        const totalTransactions = paymentRows.length + ownerRows.length;
        const completedCount = paymentRows.filter(p => p.status === 'COMPLETED').length + ownerRows.length;
        const pendingCount = paymentRows.filter(p => p.status === 'PENDING').length;
        const refundedCount = paymentRows.filter(p => p.status === 'REFUNDED').length;

        const paymentsRev = paymentRows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const subscriptionRev = ownerRows.length * 2499;
        const totalRevenue = paymentsRev + subscriptionRev;

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
            message: 'Error fetching payment stats: ' + error.message
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

        // 1. Owner Subscription Plan Buy Payments
        try {
            const [owners] = await db.query(`SELECT id, full_name, email, mobile, business_name, created_at FROM owners ORDER BY created_at DESC`);
            owners.forEach((o, index) => {
                const numId = String(o.id).replace(/[^0-9]/g, '') || String(index + 1);
                const padId = numId.padStart(6, '0');
                const paymentId = `SUB-${padId}`;

                allLogs.push({
                    _id: `sub_${o.id}`,
                    id: `sub_${o.id}`,
                    paymentId: paymentId,
                    transactionId: `TXN-SUB-${padId}`,
                    invoiceNumber: `INV-SUB-${padId}`,
                    userId: {
                        _id: o.id,
                        fullName: o.full_name || 'Venue Owner',
                        email: o.email || '',
                        mobile: o.mobile || ''
                    },
                    user: o.full_name || 'Venue Owner',
                    customer: o.full_name || 'Venue Owner',
                    type: 'SUBSCRIPTION',
                    amount: 2499,
                    commissionAmount: 250,
                    commissionRate: 10,
                    paymentMethod: 'ONLINE',
                    status: 'COMPLETED',
                    notice: 'Professional Subscription Plan Authorized',
                    paymentDate: o.created_at || new Date().toISOString(),
                    createdAt: o.created_at || new Date().toISOString(),
                    date: o.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Query owners subscription logs error:', e.message);
        }

        // 2. Booking & POS Payments
        try {
            const [payments] = await db.query(`SELECT * FROM payments ORDER BY created_at DESC`);
            payments.forEach((p, index) => {
                const numId = String(p.id).replace(/[^0-9]/g, '') || String(index + 1);
                const padId = numId.padStart(6, '0');
                const paymentId = p.invoice_number ? p.invoice_number.replace('INV-', 'PAY-') : `PAY-${padId}`;

                const pType = p.booking_id ? 'BOOKING' : 'POS';

                allLogs.push({
                    _id: `pay_${p.id}`,
                    id: `pay_${p.id}`,
                    paymentId: paymentId,
                    transactionId: `TXN-${padId}`,
                    invoiceNumber: p.invoice_number || `INV-${padId}`,
                    userId: {
                        _id: p.id,
                        fullName: p.customer_name || 'Customer',
                        email: '',
                        mobile: ''
                    },
                    user: p.customer_name || 'Customer',
                    customer: p.customer_name || 'Customer',
                    type: pType,
                    amount: Number(p.amount || 0),
                    commissionAmount: Math.round(Number(p.amount || 0) * 0.1),
                    commissionRate: 10,
                    paymentMethod: (p.payment_method || 'ONLINE').toUpperCase(),
                    status: (p.status || 'COMPLETED').toUpperCase(),
                    notice: p.booking_id ? 'Slot Booking Payment' : 'POS Checkout Sale',
                    paymentDate: p.created_at || new Date().toISOString(),
                    createdAt: p.created_at || new Date().toISOString(),
                    date: p.created_at || new Date().toISOString()
                });
            });
        } catch (e) {
            console.warn('Query payments error:', e.message);
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

        // Filter by status
        if (status) {
            filtered = filtered.filter(l => l.status === status.toUpperCase());
        }

        // Filter by type
        if (type) {
            filtered = filtered.filter(l => l.type === type.toUpperCase());
        }

        // Filter by paymentMethod
        if (paymentMethod) {
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

        const [ownerRows] = await db.query('SELECT * FROM owners WHERE id = ?', [id]);
        if (ownerRows.length > 0) {
            const o = ownerRows[0];
            return res.status(200).json({
                success: true,
                data: {
                    _id: `sub_${o.id}`,
                    id: `sub_${o.id}`,
                    paymentId: `SUB-${String(o.id).slice(-6)}`,
                    transactionId: `TXN-SUB-${o.id}`,
                    invoiceNumber: `INV-SUB-${o.id}`,
                    userId: { fullName: o.full_name, email: o.email, mobile: o.mobile },
                    type: 'SUBSCRIPTION',
                    amount: 2499,
                    commissionAmount: 250,
                    commissionRate: 10,
                    paymentMethod: 'ONLINE',
                    status: 'COMPLETED',
                    createdAt: o.created_at || new Date().toISOString()
                }
            });
        }

        return res.status(404).json({ success: false, message: 'Payment log record not found' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    processPayment,
    getBillHistory,
    getPaymentStats,
    getPaymentLogById
};
