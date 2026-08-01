const db = require('../../config/db');

/**
 * Get active wallet details and balance
 */
const getWalletBalance = async (req, res) => {
    const userId = req.user.id;

    try {
        let [rows] = await db.query('SELECT * FROM wallets WHERE user_id = ?', [userId]);

        // Dynamically create wallet if user does not have one
        if (rows.length === 0) {
            const walletId = 'wal_' + Date.now();
            await db.query('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)', [walletId, userId]);
            
            return res.status(200).json({
                success: true,
                data: {
                    balance: 0,
                    locked: 500 // standard security reserve balance
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                balance: rows[0].balance,
                locked: 500
            }
        });
    } catch (error) {
        console.error('Fetch wallet balance error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching wallet balance.'
        });
    }
};

/**
 * Retrieve transaction history formatted for UI list badges
 */
const getWalletTransactions = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query(`
            SELECT wt.* FROM wallet_transactions wt
            JOIN wallets w ON wt.wallet_id = w.id
            WHERE w.user_id = ?
            ORDER BY wt.created_at DESC
        `, [userId]);

        const formatDate = (dateVal) => {
            if (!dateVal) return '';
            const d = new Date(dateVal);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        };

        const formatted = rows.map(r => {
            const amtStr = r.amount >= 0 
                ? `+₹${r.amount.toLocaleString()}` 
                : `-₹${Math.abs(r.amount).toLocaleString()}`;

            return {
                id: r.transaction_code,
                _id: r.id,
                type: r.type,
                desc: r.description,
                amount: amtStr,
                date: formatDate(r.created_at),
                status: r.status
            };
        });

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch wallet transactions error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching transaction logs.'
        });
    }
};

/**
 * Handle quick credit top-up balance
 */
const topUpWallet = async (req, res) => {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid top-up amount greater than zero.'
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lock or create user wallet
        let [wallets] = await connection.query('SELECT * FROM wallets WHERE user_id = ? FOR UPDATE', [userId]);
        let wallet;

        if (wallets.length === 0) {
            const walletId = 'wal_' + Date.now();
            await connection.query('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)', [walletId, userId]);
            wallet = { id: walletId, balance: 0 };
        } else {
            wallet = wallets[0];
        }

        const topUpAmt = Number(amount);
        const newBalance = wallet.balance + topUpAmt;

        // 2. Update wallet balance
        await connection.query('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, wallet.id]);

        // 3. Log credit transaction
        const rand = Math.floor(1000 + Math.random() * 9000);
        const txnCode = `TXN-${rand}`;
        await connection.query(`
            INSERT INTO wallet_transactions (wallet_id, transaction_code, type, description, amount, status)
            VALUES (?, ?, 'Top-up', 'Wallet top-up', ?, 'Completed')
        `, [wallet.id, txnCode, topUpAmt]);

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: 'Wallet credited successfully',
            data: {
                balance: newBalance,
                transactionCode: txnCode
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Top-up wallet transaction error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error processing wallet top-up.'
        });
    } finally {
        connection.release();
    }
};

/**
 * Process a booking cancellation and refund the amount back to user wallet (Owner only)
 */
const refundBooking = async (req, res) => {
    const { bookingId, refundReason } = req.body;

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: 'bookingId is required to process refund.'
        });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch and verify booking details
        const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ? FOR UPDATE', [bookingId]);
        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        const booking = bookings[0];

        if (booking.status === 'CANCELLED') {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: 'This booking has already been cancelled.'
            });
        }

        // 2. Find or create customer wallet
        let [wallets] = await connection.query('SELECT * FROM wallets WHERE user_id = ? FOR UPDATE', [booking.user_id]);
        let wallet;

        if (wallets.length === 0) {
            const walletId = 'wal_' + Date.now();
            await connection.query('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)', [walletId, booking.user_id]);
            wallet = { id: walletId, balance: 0 };
        } else {
            wallet = wallets[0];
        }

        // 3. Revert slot to AVAILABLE
        await connection.query('UPDATE slots SET status = "AVAILABLE", notes = "" WHERE id = ?', [booking.slot_id]);

        // 4. Update booking status to CANCELLED
        await connection.query('UPDATE bookings SET status = "CANCELLED" WHERE id = ?', [bookingId]);

        // 5. Credit user wallet with the booking amount
        const newBalance = wallet.balance + booking.amount;
        await connection.query('UPDATE wallets SET balance = ? WHERE id = ?', [newBalance, wallet.id]);

        // 6. Record refund transaction log
        const rand = Math.floor(1000 + Math.random() * 9000);
        const txnCode = `TXN-${rand}`;
        const refundDesc = refundReason ? `Refund: ${refundReason.trim()}` : `Refund for Booking ID #${bookingId}`;
        
        await connection.query(`
            INSERT INTO wallet_transactions (wallet_id, transaction_code, type, description, amount, status)
            VALUES (?, ?, 'Refund', ?, ?, 'Completed')
        `, [wallet.id, txnCode, refundDesc, booking.amount]);

        await connection.commit();

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled and refunded successfully.',
            data: {
                refundedAmount: booking.amount,
                newBalance
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Booking refund error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error processing refund.'
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getWalletBalance,
    getWalletTransactions,
    topUpWallet,
    refundBooking
};
