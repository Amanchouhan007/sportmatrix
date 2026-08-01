const db = require('../../config/db');

/**
 * List branches with filters and pagination
 */
const getBranches = async (req, res) => {
    const { status, ownerId, search, page = 1, limit = 10 } = req.query;

    try {
        let sql = 'SELECT * FROM branches WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (ownerId && ownerId !== 'ALL') {
            sql += ' AND owner_id = ?';
            params.push(ownerId);
        }
        if (search) {
            sql += ' AND (branch_name LIKE ? OR city LIKE ? OR branch_code LIKE ?)';
            const q = `%${search}%`;
            params.push(q, q, q);
        }

        const offset = (Number(page) - 1) * Number(limit);
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
        const [[{ count }]] = await db.query(countSql, params);

        sql += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [rows] = await db.query(sql, params);

        const formatted = rows.map(r => ({
            id: r.id,
            _id: r.id,
            branchName: r.branch_name,
            branchCode: r.branch_code,
            description: r.description,
            ownerId: r.owner_id,
            subscriptionPlanId: r.subscription_plan_id,
            city: r.city,
            zipCode: r.zip_code,
            fullAddress: r.full_address,
            email: r.email,
            mobile: r.mobile,
            status: r.status,
            createdAt: r.created_at
        }));

        return res.status(200).json({
            success: true,
            data: {
                branches: formatted,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    pages: Math.ceil(count / Number(limit)) || 1
                }
            }
        });
    } catch (error) {
        console.error('Fetch branches error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching branches.'
        });
    }
};

/**
 * Get branch by ID
 */
const getBranchById = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM branches WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.'
            });
        }

        const r = rows[0];
        const formatted = {
            id: r.id,
            _id: r.id,
            branchName: r.branch_name,
            branchCode: r.branch_code,
            description: r.description,
            ownerId: r.owner_id,
            subscriptionPlanId: r.subscription_plan_id,
            city: r.city,
            zipCode: r.zip_code,
            fullAddress: r.full_address,
            email: r.email,
            mobile: r.mobile,
            status: r.status,
            createdAt: r.created_at
        };

        return res.status(200).json({
            success: true,
            data: formatted
        });
    } catch (error) {
        console.error('Fetch branch by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching branch.'
        });
    }
};

/**
 * Create a new branch
 */
const createBranch = async (req, res) => {
    const { 
        branchName, description, ownerId, subscriptionPlanId, 
        country, state, city, zipCode, fullAddress, 
        email, mobile, alternateMobile, gstNumber, 
        timezone, currency, logo 
    } = req.body;

    if (!branchName || !email) {
        return res.status(400).json({
            success: false,
            message: 'branchName and email are required fields.'
        });
    }

    try {
        const branchId = 'br_' + Date.now();
        const branchCode = 'BR-' + Math.floor(1000 + Math.random() * 9000);

        let validOwnerId = null;
        if (ownerId) {
            const [userCheck] = await db.query('SELECT id FROM users WHERE id = ?', [ownerId]);
            if (userCheck.length > 0) {
                validOwnerId = ownerId;
            } else {
                const [firstOwner] = await db.query("SELECT id FROM users WHERE role IN ('OWNER', 'SUPER_ADMIN') LIMIT 1");
                validOwnerId = firstOwner.length > 0 ? firstOwner[0].id : null;
            }
        } else {
            const [firstOwner] = await db.query("SELECT id FROM users WHERE role IN ('OWNER', 'SUPER_ADMIN') LIMIT 1");
            validOwnerId = firstOwner.length > 0 ? firstOwner[0].id : null;
        }

        await db.query(`
            INSERT INTO branches (
                id, branch_name, branch_code, description, owner_id, subscription_plan_id,
                country, state, city, zip_code, full_address, email, mobile, alternate_mobile,
                gst_number, timezone, currency, logo, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `, [
            branchId,
            branchName,
            branchCode,
            description || '',
            validOwnerId,
            subscriptionPlanId || 'plan_starter',
            country || 'India',
            state || '',
            city || '',
            zipCode || '',
            fullAddress || '',
            email,
            mobile || '',
            alternateMobile || '',
            gstNumber || '',
            timezone || 'Asia/Kolkata',
            currency || 'INR',
            logo || ''
        ]);

        return res.status(201).json({
            success: true,
            message: 'Branch created successfully.',
            data: { id: branchId, branchName }
        });
    } catch (error) {
        console.error('Create branch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error creating branch: ' + error.message
        });
    }
};

/**
 * Update branch details
 */
const updateBranch = async (req, res) => {
    const { id } = req.params;
    const { branchName, description, city, zipCode, fullAddress, email, mobile } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM branches WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.'
            });
        }

        await db.query(`
            UPDATE branches 
            SET 
                branch_name = COALESCE(?, branch_name),
                description = COALESCE(?, description),
                city = COALESCE(?, city),
                zip_code = COALESCE(?, zip_code),
                full_address = COALESCE(?, full_address),
                email = COALESCE(?, email),
                mobile = COALESCE(?, mobile)
            WHERE id = ?
        `, [branchName, description, city, zipCode, fullAddress, email, mobile, id]);

        return res.status(200).json({
            success: true,
            message: 'Branch details updated successfully.'
        });
    } catch (error) {
        console.error('Update branch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating branch details.'
        });
    }
};

/**
 * Update branch status
 */
const changeBranchStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const [result] = await db.query('UPDATE branches SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Branch status successfully updated to ${status}.`
        });
    } catch (error) {
        console.error('Change branch status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating status.'
        });
    }
};

/**
 * Remove a branch
 */
const deleteBranch = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM branches WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Branch deleted successfully.'
        });
    } catch (error) {
        console.error('Delete branch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error deleting branch.'
        });
    }
};

/**
 * Get dashboard status
 */
const getDashboardStats = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status='INACTIVE' THEN 1 ELSE 0 END) as inactive
            FROM branches
        `);

        return res.status(200).json({
            success: true,
            data: {
                totalBranches: rows[0].total,
                activeBranches: rows[0].active,
                inactiveBranches: rows[0].inactive,
                suspendedBranches: 0
            }
        });
    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.'
        });
    }
};

module.exports = {
    getBranches,
    getBranchById,
    createBranch,
    updateBranch,
    changeBranchStatus,
    deleteBranch,
    getDashboardStats
};
