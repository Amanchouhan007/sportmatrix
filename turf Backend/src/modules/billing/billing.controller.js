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
        // Generate a random unique invoice number e.g. INV-3849
        const rand = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${rand}`;

        // Insert payment details into the DB
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
 * Get billing / invoices history logs
 */
const getBillHistory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM payments ORDER BY created_at DESC');

        // Helper to format date to "May 22, 2026"
        const formatDate = (dateVal) => {
            if (!dateVal) return '';
            const d = new Date(dateVal);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        };

        // Format mapping for frontend table compatibility
        const formattedBills = rows.map(r => ({
            id: r.invoice_number,
            customer: r.customer_name,
            type: r.booking_id ? 'Turf Booking' : 'POS Checkout',
            amount: `₹${r.amount.toLocaleString()}`,
            method: r.payment_method,
            status: r.status === 'COMPLETED' ? 'Completed' : 'Pending',
            date: formatDate(r.created_at)
        }));

        return res.status(200).json({
            success: true,
            data: formattedBills
        });
    } catch (error) {
        console.error('Fetch billing history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching billing ledger.'
        });
    }
};

module.exports = {
    processPayment,
    getBillHistory
};
