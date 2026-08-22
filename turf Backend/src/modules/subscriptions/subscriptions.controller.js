const db = require('../../config/db');

/**
 * Format subscription plan row to clean JSON matching frontend expectations
 */
const formatPlan = (r) => {
    if (!r) return null;
    let featuresArr = [];
    if (r.features) {
        if (typeof r.features === 'string') {
            try {
                featuresArr = JSON.parse(r.features);
            } catch (e) {
                featuresArr = [];
            }
        } else if (Array.isArray(r.features)) {
            featuresArr = r.features;
        }
    }

    return {
        id: r.id,
        _id: r.id,
        planName: r.plan_name,
        description: r.description || '',
        isPopular: Boolean(r.is_popular),
        status: r.status || 'active',
        monthlyPricing: {
            price: Number(r.monthly_price || 0),
            branchLimit: Number(r.monthly_branch_limit ?? 1),
            sportsLimit: Number(r.monthly_sports_limit ?? 2),
            bookingLimit: Number(r.monthly_booking_limit ?? 200),
            activeUsersLimit: Number(r.monthly_active_users_limit ?? 5)
        },
        yearlyPricing: {
            price: Number(r.yearly_price || 0),
            branchLimit: Number(r.yearly_branch_limit ?? 1),
            sportsLimit: Number(r.yearly_sports_limit ?? 2),
            bookingLimit: Number(r.yearly_booking_limit ?? 2500),
            activeUsersLimit: Number(r.yearly_active_users_limit ?? 5)
        },
        features: featuresArr,
        createdAt: r.created_at,
        updatedAt: r.updated_at
    };
};

/**
 * GET /api/v1/subscriptions
 * Fetch all subscription plans
 */
const getAllPlans = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM subscription_plans ORDER BY created_at ASC');
        const plans = rows.map(formatPlan);

        return res.status(200).json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription plans',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/subscriptions/:id
 * Fetch single plan by ID
 */
const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: formatPlan(rows[0])
        });
    } catch (error) {
        console.error('Error fetching plan by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch plan details',
            error: error.message
        });
    }
};

/**
 * POST /api/v1/subscriptions
 * Create a new Subscription Plan
 */
const createPlan = async (req, res) => {
    try {
        const {
            planName,
            description,
            isPopular = false,
            status = 'active',
            monthlyPricing = {},
            yearlyPricing = {},
            features = []
        } = req.body;

        const planId = `plan_${Date.now()}`;
        const featuresJson = JSON.stringify(features);

        const insertQuery = `
            INSERT INTO subscription_plans (
                id, plan_name, description, is_popular, status,
                monthly_price, monthly_branch_limit, monthly_sports_limit, monthly_booking_limit, monthly_active_users_limit,
                yearly_price, yearly_branch_limit, yearly_sports_limit, yearly_booking_limit, yearly_active_users_limit,
                features
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(insertQuery, [
            planId,
            planName.trim(),
            description ? description.trim() : null,
            isPopular ? 1 : 0,
            status,
            monthlyPricing.price || 0,
            monthlyPricing.branchLimit ?? 1,
            monthlyPricing.sportsLimit ?? 2,
            monthlyPricing.bookingLimit ?? 200,
            monthlyPricing.activeUsersLimit ?? 5,
            yearlyPricing.price || 0,
            yearlyPricing.branchLimit ?? 1,
            yearlyPricing.sportsLimit ?? 2,
            yearlyPricing.bookingLimit ?? 2500,
            yearlyPricing.activeUsersLimit ?? 5,
            featuresJson
        ]);

        const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
        const created = formatPlan(rows[0]);

        return res.status(201).json({
            success: true,
            message: 'Subscription plan created successfully',
            data: created
        });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create subscription plan',
            error: error.message
        });
    }
};

/**
 * PUT /api/v1/subscriptions/:id
 * Update an existing Subscription Plan
 */
const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        const current = existing[0];
        const {
            planName,
            description,
            isPopular,
            status,
            monthlyPricing,
            yearlyPricing,
            features
        } = req.body;

        const updateName = planName !== undefined ? planName.trim() : current.plan_name;
        const updateDesc = description !== undefined ? description.trim() : current.description;
        const updatePopular = isPopular !== undefined ? (isPopular ? 1 : 0) : current.is_popular;
        const updateStatus = status !== undefined ? status : current.status;

        const mPrice = monthlyPricing?.price !== undefined ? monthlyPricing.price : current.monthly_price;
        const mBranch = monthlyPricing?.branchLimit !== undefined ? monthlyPricing.branchLimit : current.monthly_branch_limit;
        const mSports = monthlyPricing?.sportsLimit !== undefined ? monthlyPricing.sportsLimit : current.monthly_sports_limit;
        const mBooking = monthlyPricing?.bookingLimit !== undefined ? monthlyPricing.bookingLimit : current.monthly_booking_limit;
        const mUsers = monthlyPricing?.activeUsersLimit !== undefined ? monthlyPricing.activeUsersLimit : current.monthly_active_users_limit;

        const yPrice = yearlyPricing?.price !== undefined ? yearlyPricing.price : current.yearly_price;
        const yBranch = yearlyPricing?.branchLimit !== undefined ? yearlyPricing.branchLimit : current.yearly_branch_limit;
        const ySports = yearlyPricing?.sportsLimit !== undefined ? yearlyPricing.sportsLimit : current.yearly_sports_limit;
        const yBooking = yearlyPricing?.bookingLimit !== undefined ? yearlyPricing.bookingLimit : current.yearly_booking_limit;
        const yUsers = yearlyPricing?.activeUsersLimit !== undefined ? yearlyPricing.activeUsersLimit : current.yearly_active_users_limit;

        const featuresJson = features !== undefined ? JSON.stringify(features) : current.features;

        const updateQuery = `
            UPDATE subscription_plans SET
                plan_name = ?,
                description = ?,
                is_popular = ?,
                status = ?,
                monthly_price = ?,
                monthly_branch_limit = ?,
                monthly_sports_limit = ?,
                monthly_booking_limit = ?,
                monthly_active_users_limit = ?,
                yearly_price = ?,
                yearly_branch_limit = ?,
                yearly_sports_limit = ?,
                yearly_booking_limit = ?,
                yearly_active_users_limit = ?,
                features = ?
            WHERE id = ?
        `;

        await db.query(updateQuery, [
            updateName,
            updateDesc,
            updatePopular,
            updateStatus,
            mPrice,
            mBranch,
            mSports,
            mBooking,
            mUsers,
            yPrice,
            yBranch,
            ySports,
            yBooking,
            yUsers,
            featuresJson,
            id
        ]);

        const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
        const updated = formatPlan(rows[0]);

        return res.status(200).json({
            success: true,
            message: 'Subscription plan updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update subscription plan',
            error: error.message
        });
    }
};

/**
 * DELETE /api/v1/subscriptions/:id
 * Delete a Subscription Plan
 */
const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT id FROM subscription_plans WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete subscription plan',
            error: error.message
        });
    }
};

/**
 * PATCH /api/v1/subscriptions/:id/status
 * Toggle Status (active / inactive)
 */
const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (active, inactive)'
            });
        }

        const [existing] = await db.query('SELECT id FROM subscription_plans WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        await db.query('UPDATE subscription_plans SET status = ? WHERE id = ?', [status, id]);

        return res.status(200).json({
            success: true,
            message: `Status updated to ${status}`
        });
    } catch (error) {
        console.error('Error toggling plan status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update plan status',
            error: error.message
        });
    }
};

/**
 * PATCH /api/v1/subscriptions/:id/popular
 * Toggle Popularity (true / false)
 */
const togglePopular = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPopular } = req.body;

        const [existing] = await db.query('SELECT id FROM subscription_plans WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        await db.query('UPDATE subscription_plans SET is_popular = ? WHERE id = ?', [isPopular ? 1 : 0, id]);

        return res.status(200).json({
            success: true,
            message: 'Popular status updated'
        });
    } catch (error) {
        console.error('Error toggling plan popularity:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update plan popularity',
            error: error.message
        });
    }
};

/**
 * POST /api/v1/subscriptions/buy
 * Purchase a subscription plan (Creates entry in owner_subscriptions)
 */
const purchaseSubscription = async (req, res) => {
    try {
        const {
            ownerId,
            planId,
            billingCycle = 'MONTHLY',
            paymentMethod = 'UPI'
        } = req.body;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'planId is required to purchase subscription'
            });
        }

        // 1. Fetch Plan details
        const [planRows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [planId]);
        if (planRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }
        const plan = planRows[0];
        const amount = billingCycle === 'YEARLY' ? Number(plan.yearly_price || 0) : Number(plan.monthly_price || 0);

        const subId = `sub_${Date.now()}`;
        const txId = `TXN_${Date.now()}`;
        const validOwnerId = ownerId || req.user?.id || 'own_001';

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (billingCycle === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        await db.query(`
            INSERT INTO owner_subscriptions (
                id, owner_id, plan_id, plan_name, amount, billing_cycle,
                status, payment_status, payment_method, transaction_id, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 'COMPLETED', ?, ?, ?, ?)
        `, [
            subId,
            validOwnerId,
            plan.id,
            plan.plan_name,
            amount,
            billingCycle,
            paymentMethod,
            txId,
            startDate,
            endDate
        ]);

        // Update owner active plan
        try {
            await db.query('UPDATE owners SET active_plan_id = ? WHERE id = ?', [plan.id, validOwnerId]);
        } catch (e) {}

        return res.status(201).json({
            success: true,
            message: `Successfully subscribed to ${plan.plan_name}`,
            data: {
                id: subId,
                ownerId: validOwnerId,
                planId: plan.id,
                planName: plan.plan_name,
                amount,
                billingCycle,
                paymentStatus: 'COMPLETED',
                transactionId: txId,
                startDate,
                endDate
            }
        });
    } catch (error) {
        console.error('Error purchasing subscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to complete subscription purchase',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/subscriptions/purchases
 * Get all owner subscription purchases
 */
const getSubscriptionPurchases = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                os.*,
                o.full_name as owner_name,
                o.business_name
            FROM owner_subscriptions os
            LEFT JOIN owners o ON os.owner_id = o.id
            ORDER BY os.created_at DESC
        `);

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching subscription purchases:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription purchases',
            error: error.message
        });
    }
};

module.exports = {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
    toggleStatus,
    togglePopular,
    purchaseSubscription,
    getSubscriptionPurchases
};
