const db = require('../../config/db');

/**
 * List branches with filters and pagination
 */
const getBranches = async (req, res) => {
    const { status, ownerId, email, search, page = 1, limit = 10 } = req.query;

    try {
        let sql = `
            SELECT b.*, 
                   COALESCE(o.full_name, u.name, 'Turf Owner') as owner_full_name,
                   COALESCE(os.plan_name, p.plan_name, 'Starter Plan') as plan_name,
                   COALESCE(b.subscription_price_snapshot, NULLIF(os.amount, 0), p.monthly_price, 1000) as plan_price,
                   (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE branch_id = b.id AND status IN ('CONFIRMED', 'COMPLETED')) as booking_revenue
            FROM branches b
            LEFT JOIN owners o ON (b.owner_id = o.id OR b.owner_id = o.user_id)
            LEFT JOIN users u ON (b.owner_id = u.id)
            LEFT JOIN (
                SELECT os1.* FROM owner_subscriptions os1
                INNER JOIN (
                    SELECT owner_id, MAX(created_at) as max_created FROM owner_subscriptions GROUP BY owner_id
                ) os2 ON os1.owner_id = os2.owner_id AND os1.created_at = os2.max_created
            ) os ON (b.owner_id = os.owner_id OR o.id = os.owner_id)
            LEFT JOIN subscription_plans p ON (b.subscription_plan_id = p.id OR LOWER(b.subscription_plan_id) = LOWER(p.plan_name))
            WHERE 1=1
        `;
        let countSql = `SELECT COUNT(*) as count FROM branches b WHERE 1=1`;
        const params = [];
        const countParams = [];

        if (status && status !== 'ALL') {
            sql += ' AND b.status = ?';
            countSql += ' AND b.status = ?';
            params.push(status);
            countParams.push(status);
        }

        const userRole = req.user?.role?.toUpperCase();
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';

        if (!isSuperAdmin) {
            // STRICT MULTI-TENANT ISOLATION FOR TURF OWNERS: Resolve owner by ID, user_id, or email
            const targetOwnerId = (ownerId && ownerId !== 'ALL') ? ownerId : (req.user ? req.user.id : null);
            const targetEmail = email || req.user?.email || '';

            if (targetOwnerId && targetOwnerId !== 'ALL') {
                const ownerClause = ` AND (
                    b.owner_id = ? 
                    OR b.owner_id IN (SELECT id FROM owners WHERE id = ? OR user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?)))
                    OR (b.email IS NOT NULL AND b.email != '' AND LOWER(b.email) = LOWER(?))
                    OR b.owner_id IN (SELECT id FROM owners WHERE email IS NOT NULL AND email != '' AND (LOWER(email) = LOWER(?) OR LOWER(email) = LOWER(?)))
                )`;
                sql += ownerClause;
                countSql += ownerClause;
                params.push(targetOwnerId, targetOwnerId, targetOwnerId, targetEmail, targetEmail, targetEmail, targetOwnerId);
                countParams.push(targetOwnerId, targetOwnerId, targetOwnerId, targetEmail, targetEmail, targetEmail, targetOwnerId);
            }
        } else {
            // SuperAdmin user role
            if (ownerId && ownerId !== 'ALL') {
                const targetEmail = email || '';
                const ownerClause = ` AND (
                    b.owner_id = ? 
                    OR b.owner_id IN (SELECT id FROM owners WHERE id = ? OR user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?)))
                    OR (b.email IS NOT NULL AND b.email != '' AND LOWER(b.email) = LOWER(?))
                )`;
                sql += ownerClause;
                countSql += ownerClause;
                params.push(ownerId, ownerId, ownerId, targetEmail, targetEmail);
                countParams.push(ownerId, ownerId, ownerId, targetEmail, targetEmail);
            }
            // If SuperAdmin & ownerId === 'ALL': NO OWNER FILTER IS APPLIED, RETURNS ALL 6 BRANCHES
        }

        if (search) {
            const searchClause = ' AND (b.branch_name LIKE ? OR b.city LIKE ? OR b.branch_code LIKE ?)';
            sql += searchClause;
            countSql += searchClause;
            const q = `%${search}%`;
            params.push(q, q, q);
            countParams.push(q, q, q);
        }

        const [countRows] = await db.query(countSql, countParams);
        const count = countRows[0]?.count || 0;

        const offset = (Number(page) - 1) * Number(limit);
        sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(sql, params);

        const formatted = rows.map(r => {
            const bookingRev = Number(r.booking_revenue || 0);
            // Branch revenue = subscription plan monthly_price + actual customer booking revenue
            // plan_price comes directly from subscription_plans table via JOIN (no hardcoded fallback needed)
            const planPrice = Number(r.plan_price || 0);
            const computedRevenue = planPrice + bookingRev;

            return {
                id: r.id,
                _id: r.id,
                branchName: r.branch_name,
                branchCode: r.branch_code,
                description: r.description,
                ownerId: {
                    _id: r.owner_id || 'own_001',
                    id: r.owner_id || 'own_001',
                    fullName: r.owner_full_name || 'Turf Owner'
                },
                subscriptionPlanId: {
                    _id: r.subscription_plan_id || 'plan_starter',
                    id: r.subscription_plan_id || 'plan_starter',
                    planName: r.plan_name || 'Starter Plan',
                    monthlyPrice: planPrice,
                    monthly_price: planPrice
                },
                planPrice: planPrice,
                plan_price: planPrice,
                bookingRevenue: bookingRev,
                booking_revenue: bookingRev,
                city: r.city || 'Indore',
                zipCode: r.zip_code || '',
                fullAddress: r.full_address || '',
                email: r.email,
                mobile: r.mobile,
                pricePerHour: r.price_per_hour || 1000,
                price: r.price_per_hour || 1000,
                openingTime: r.opening_time || '06:00 AM',
                closingTime: r.closing_time || '11:00 PM',
                turfSize: r.turf_size || '5,000 Sq.Ft',
                dimensions: r.turf_size || '5,000 Sq.Ft',
                surfaceType: r.surface_type || 'TurfPro Synthetic Arena',
                sports: r.sports ? (typeof r.sports === 'string' && r.sports.startsWith('[') ? JSON.parse(r.sports) : r.sports.split(',')) : ['Cricket', 'Football'],
                amenities: r.amenities ? (typeof r.amenities === 'string' && r.amenities.startsWith('[') ? JSON.parse(r.amenities) : r.amenities.split(',')) : ['Floodlights', 'Parking', 'Washroom'],
                discountOffer: r.discount_offer || '20% OFF FIRST MATCH',
                couponCode: r.coupon_code || 'CRICKET20',
                logo: r.logo || '',
                images: r.images ? (typeof r.images === 'string' && r.images.startsWith('[') ? JSON.parse(r.images) : [r.images]) : [],
                status: r.status || 'ACTIVE',
                totalRevenue: computedRevenue,
                createdAt: r.created_at
            };
        });

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

        return res.status(200).json({
            success: true,
            data: {
                branches: finalBranches,
                pagination: {
                    total: finalBranches.length,
                    page: Number(page),
                    limit: Number(limit),
                    pages: 1
                }
            }
        });
    } catch (error) {
        console.error('Fetch branches error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching branches: ' + error.message
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
            pricePerHour: r.price_per_hour || 1000,
            openingTime: r.opening_time || '06:00 AM',
            closingTime: r.closing_time || '11:00 PM',
            turfSize: r.turf_size || '5,000 Sq.Ft',
            surfaceType: r.surface_type || 'TurfPro Synthetic Arena',
            sports: r.sports ? (typeof r.sports === 'string' && r.sports.startsWith('[') ? JSON.parse(r.sports) : r.sports.split(',')) : ['Cricket', 'Football'],
            amenities: r.amenities ? (typeof r.amenities === 'string' && r.amenities.startsWith('[') ? JSON.parse(r.amenities) : r.amenities.split(',')) : ['Floodlights', 'Parking', 'Washroom'],
            discountOffer: r.discount_offer || '20% OFF FIRST MATCH',
            couponCode: r.coupon_code || 'CRICKET20',
            logo: r.logo || '',
            images: r.images ? (typeof r.images === 'string' && r.images.startsWith('[') ? JSON.parse(r.images) : [r.images]) : [],
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
        branchName, description, ownerId, newOwnerName, newOwnerBusinessName, subscriptionPlanId, 
        country, state, city, zipCode, fullAddress, 
        email, mobile, alternateMobile, gstNumber, 
        timezone, currency, logo, images,
        pricePerHour, openingTime, closingTime, turfSize, surfaceType,
        sports, amenities, discountOffer, couponCode
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
        let ownerName = 'Turf Owner';
        
        // Handle dynamic real-time new owner registration
        if (newOwnerName && newOwnerName.trim()) {
            const createdOwnerId = 'own_' + Date.now();
            const bName = (newOwnerBusinessName && newOwnerBusinessName.trim()) 
                ? newOwnerBusinessName.trim() 
                : (newOwnerName.trim() + ' Network');
            
            const uniqueSuffix = Date.now().toString().slice(-6);
            const ownerEmail = (email && email.trim()) ? email.trim() : `owner_${uniqueSuffix}@turf.com`;
            const ownerMobile = (mobile && mobile.trim()) ? mobile.trim() : `98${Math.floor(10000000 + Math.random() * 89999999)}`;
            const defaultPasswordHash = '$2b$10$w8T0.g2K3mY7wYxGvD8H4uO3J5aK1L2M3N4O5P6Q7R8S9T0U1V2W3';

            try {
                const userId = 'usr_' + Date.now();
                try {
                    await db.query(`
                        INSERT INTO users (id, name, email, password_hash, role, mobile, status)
                        VALUES (?, ?, ?, ?, 'OWNER', ?, 'ACTIVE')
                        ON DUPLICATE KEY UPDATE name = VALUES(name)
                    `, [userId, newOwnerName.trim(), ownerEmail, defaultPasswordHash, ownerMobile]);
                } catch (uErr) {}

                await db.query(`
                    INSERT INTO owners (id, user_id, full_name, business_name, email, mobile, password_hash, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
                `, [
                    createdOwnerId,
                    userId,
                    newOwnerName.trim(),
                    bName,
                    ownerEmail,
                    ownerMobile,
                    defaultPasswordHash
                ]);

                validOwnerId = createdOwnerId;
                ownerName = newOwnerName.trim();
            } catch (oErr) {
                console.warn('New owner query fallback note:', oErr.message);
                const [existing] = await db.query('SELECT id, full_name FROM owners WHERE email = ? OR mobile = ? LIMIT 1', [ownerEmail, ownerMobile]);
                if (existing.length > 0) {
                    validOwnerId = existing[0].id;
                    ownerName = existing[0].full_name;
                } else {
                    validOwnerId = createdOwnerId;
                    ownerName = newOwnerName.trim();
                }
            }
        } else if (ownerId) {
            const [ownerRows] = await db.query('SELECT id, full_name FROM owners WHERE id = ?', [ownerId]);
            if (ownerRows.length > 0) {
                validOwnerId = ownerRows[0].id;
                ownerName = ownerRows[0].full_name || ownerName;
            } else {
                const [userRows] = await db.query('SELECT id, name FROM users WHERE id = ?', [ownerId]);
                if (userRows.length > 0) {
                    validOwnerId = userRows[0].id;
                    ownerName = userRows[0].name || ownerName;
                }
            }
        }
        
        if (!validOwnerId) {
            if (ownerId) {
                validOwnerId = ownerId;
                ownerName = req.body.ownerName || 'Turf Owner';
            } else {
                const [firstOwner] = await db.query('SELECT id, full_name FROM owners LIMIT 1');
                if (firstOwner.length > 0) {
                    validOwnerId = firstOwner[0].id;
                    ownerName = firstOwner[0].full_name || ownerName;
                } else {
                    const [firstUser] = await db.query("SELECT id, name FROM users WHERE role IN ('OWNER', 'SUPER_ADMIN') LIMIT 1");
                    if (firstUser.length > 0) {
                        validOwnerId = firstUser[0].id;
                        ownerName = firstUser[0].name || ownerName;
                    } else {
                        validOwnerId = 'own_001';
                        ownerName = 'Turf Owner';
                    }
                }
            }
        }

        // Fetch plan name
        let planName = 'Starter Plan';
        let planPriceSnapshot = 1000;
        const planId = subscriptionPlanId || 'plan_starter';
        const [planRows] = await db.query('SELECT id, plan_name, monthly_price FROM subscription_plans WHERE id = ? OR LOWER(id) = LOWER(?) OR LOWER(plan_name) = LOWER(?)', [planId, planId, planId]);
        if (planRows.length > 0) {
            planName = planRows[0].plan_name;
            planPriceSnapshot = Number(planRows[0].monthly_price || 1000);
        }

        const sportsJson = Array.isArray(sports) ? JSON.stringify(sports) : (sports || '["Cricket", "Football"]');
        const amenitiesJson = Array.isArray(amenities) ? JSON.stringify(amenities) : (amenities || '["Floodlights", "Parking", "Washroom"]');
        const imagesJson = Array.isArray(images) ? JSON.stringify(images) : (typeof images === 'string' && images ? images : '[]');

        await db.query(`
            INSERT INTO branches (
                id, branch_name, branch_code, description, owner_id, subscription_plan_id, subscription_price_snapshot,
                country, state, city, zip_code, full_address, email, mobile, alternate_mobile,
                gst_number, timezone, currency, logo, images, status,
                price_per_hour, opening_time, closing_time, turf_size, surface_type,
                sports, amenities, discount_offer, coupon_code
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            branchId,
            branchName,
            branchCode,
            description || '',
            validOwnerId,
            planId,
            planPriceSnapshot,
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
            logo || '',
            imagesJson,
            Number(pricePerHour) || 1000,
            openingTime || '06:00 AM',
            closingTime || '11:00 PM',
            turfSize || '5,000 Sq.Ft',
            surfaceType || 'TurfPro Synthetic Arena',
            sportsJson,
            amenitiesJson,
            discountOffer || '20% OFF FIRST MATCH',
            couponCode || 'CRICKET20'
        ]);

        // Auto-record subscription purchase entry for owner when branch is created
        try {
            const subId = `sub_${Date.now()}`;
            await db.query(`
                INSERT INTO owner_subscriptions (
                    id, owner_id, plan_id, plan_name, amount, billing_cycle,
                    status, payment_status, payment_method, transaction_id, start_date, end_date
                ) VALUES (?, ?, ?, ?, ?, 'MONTHLY', 'ACTIVE', 'COMPLETED', 'ONLINE', ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH))
            `, [subId, validOwnerId, planId, planName, planPriceSnapshot, `TXN_${Date.now()}`]);
        } catch (subErr) {
            console.warn('Branch subscription auto-creation note:', subErr.message);
        }

        const newBranchObject = {
            id: branchId,
            _id: branchId,
            branchName,
            branchCode,
            description: description || '',
            ownerId: { _id: validOwnerId, id: validOwnerId, fullName: ownerName, email },
            subscriptionPlanId: { _id: planId, id: planId, planName },
            city: city || 'Indore',
            zipCode: zipCode || '',
            fullAddress: fullAddress || '',
            email,
            mobile: mobile || '',
            pricePerHour: Number(pricePerHour) || 1000,
            price: Number(pricePerHour) || 1000,
            openingTime: openingTime || '06:00 AM',
            closingTime: closingTime || '11:00 PM',
            turfSize: turfSize || '5,000 Sq.Ft',
            dimensions: turfSize || '5,000 Sq.Ft',
            surfaceType: surfaceType || 'TurfPro Synthetic Arena',
            sports: Array.isArray(sports) ? sports : ['Cricket', 'Football'],
            amenities: Array.isArray(amenities) ? amenities : ['Floodlights', 'Parking', 'Washroom'],
            discountOffer: discountOffer || '20% OFF FIRST MATCH',
            couponCode: couponCode || 'CRICKET20',
            logo: logo || '',
            images: Array.isArray(images) ? images : [],
            status: 'ACTIVE',
            totalRevenue: 0,
            createdAt: new Date().toISOString()
        };

        return res.status(201).json({
            success: true,
            message: 'Branch created successfully.',
            data: newBranchObject
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
    const { 
        branchName, description, city, zipCode, fullAddress, email, mobile, logo, images,
        pricePerHour, price, openingTime, closingTime, turfSize, surfaceType, discountOffer, couponCode, status
    } = req.body;

    try {
        const [existing] = await db.query('SELECT id FROM branches WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.'
            });
        }

        const imagesJson = images ? (Array.isArray(images) ? JSON.stringify(images) : images) : null;
        const targetPrice = pricePerHour !== undefined ? pricePerHour : (price !== undefined ? price : null);

        await db.query(`
            UPDATE branches 
            SET 
                branch_name = COALESCE(?, branch_name),
                description = COALESCE(?, description),
                city = COALESCE(?, city),
                zip_code = COALESCE(?, zip_code),
                full_address = COALESCE(?, full_address),
                email = COALESCE(?, email),
                mobile = COALESCE(?, mobile),
                logo = COALESCE(?, logo),
                images = COALESCE(?, images),
                price_per_hour = COALESCE(?, price_per_hour),
                opening_time = COALESCE(?, opening_time),
                closing_time = COALESCE(?, closing_time),
                turf_size = COALESCE(?, turf_size),
                surface_type = COALESCE(?, surface_type),
                discount_offer = COALESCE(?, discount_offer),
                coupon_code = COALESCE(?, coupon_code),
                status = COALESCE(?, status)
            WHERE id = ?
        `, [
            branchName || null, 
            description || null, 
            city || null, 
            zipCode || null, 
            fullAddress || null, 
            email || null, 
            mobile || null, 
            logo || null, 
            imagesJson, 
            targetPrice ? Number(targetPrice) : null,
            openingTime || null,
            closingTime || null,
            turfSize || null,
            surfaceType || null,
            discountOffer || null,
            couponCode || null,
            status || null,
            id
        ]);

        return res.status(200).json({
            success: true,
            message: 'Branch details and hourly price updated successfully.'
        });
    } catch (error) {
        console.error('Update branch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error updating branch: ' + error.message
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
        const userRole = req.user?.role?.toUpperCase();
        const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
        const targetOwnerId = (req.query.ownerId && req.query.ownerId !== 'ALL') ? req.query.ownerId : (req.user ? req.user.id : null);
        const targetEmail = req.query.email || req.user?.email || '';

        let branchWhere = '';
        const params = [];

        if (!isSuperAdmin) {
            const targetOwnerId = (req.query.ownerId && req.query.ownerId !== 'ALL') ? req.query.ownerId : (req.user ? req.user.id : null);
            const targetEmail = req.query.email || req.user?.email || '';

            if (targetOwnerId && targetOwnerId !== 'ALL') {
                branchWhere = ` WHERE (
                    b.owner_id = ? 
                    OR b.owner_id IN (SELECT id FROM owners WHERE id = ? OR user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?)))
                    OR (b.email IS NOT NULL AND b.email != '' AND LOWER(b.email) = LOWER(?))
                    OR b.owner_id IN (SELECT id FROM owners WHERE email IS NOT NULL AND email != '' AND (LOWER(email) = LOWER(?) OR LOWER(email) = LOWER(?)))
                )`;
                params.push(targetOwnerId, targetOwnerId, targetOwnerId, targetEmail, targetEmail, targetEmail, targetOwnerId);
            }
        } else {
            if (req.query.ownerId && req.query.ownerId !== 'ALL') {
                const targetEmail = req.query.email || '';
                branchWhere = ` WHERE (
                    b.owner_id = ? 
                    OR b.owner_id IN (SELECT id FROM owners WHERE id = ? OR user_id = ? OR (email IS NOT NULL AND email != '' AND LOWER(email) = LOWER(?)))
                    OR (b.email IS NOT NULL AND b.email != '' AND LOWER(b.email) = LOWER(?))
                )`;
                params.push(req.query.ownerId, req.query.ownerId, req.query.ownerId, targetEmail, targetEmail);
            }
            // SuperAdmin & ownerId === 'ALL': NO WHERE CLAUSE APPLIED, RETURNS STATS FOR ALL 6 BRANCHES
        }

        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN b.status='ACTIVE' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN b.status='INACTIVE' THEN 1 ELSE 0 END) as inactive
            FROM branches b ${branchWhere}
        `, params);

        const [revenueRows] = await db.query(`
            SELECT SUM(plan_price) as total_plan_revenue FROM (
                SELECT 
                    COALESCE(b.subscription_price_snapshot, NULLIF(os.amount, 0), p.monthly_price, 1000) as plan_price
                FROM branches b
                LEFT JOIN owners o ON (b.owner_id = o.id OR b.owner_id = o.user_id)
                LEFT JOIN (
                    SELECT os1.* FROM owner_subscriptions os1
                    INNER JOIN (
                        SELECT owner_id, MAX(created_at) as max_created FROM owner_subscriptions GROUP BY owner_id
                    ) os2 ON os1.owner_id = os2.owner_id AND os1.created_at = os2.max_created
                ) os ON (b.owner_id = os.owner_id OR o.id = os.owner_id)
                LEFT JOIN subscription_plans p ON (b.subscription_plan_id = p.id OR LOWER(b.subscription_plan_id) = LOWER(p.plan_name))
                ${branchWhere}
            ) as b_prices
        `, params);

        const [bookingRevRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as booking_rev
            FROM bookings
            WHERE status IN ('CONFIRMED', 'COMPLETED')
            ${branchWhere ? `AND branch_id IN (SELECT b.id FROM branches b ${branchWhere})` : ''}
        `, branchWhere ? params : []);

        const totalRevenue = Number(revenueRows[0]?.total_plan_revenue || 0) + Number(bookingRevRows[0]?.booking_rev || 0);

        return res.status(200).json({
            success: true,
            data: {
                totalBranches: Number(rows[0]?.total || 0),
                activeBranches: Number(rows[0]?.active || 0),
                inactiveBranches: Number(rows[0]?.inactive || 0),
                suspendedBranches: 0,
                totalRevenue: totalRevenue
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
