const db = require('../../config/db');

/**
 * Format DB row to JSON object
 */
const formatDiscountRow = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        _id: row.id,
        ownerId: row.owner_id,
        turfId: row.turf_id,
        turfName: row.turf_name || 'Champions Turf Arena',
        ownerName: row.owner_name || 'Rajesh Sharma',
        title: row.title,
        description: row.description || '',
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        minimumBookingAmount: Number(row.minimum_booking_amount || 0),
        maximumDiscountAmount: Number(row.maximum_discount_amount || 0),
        promoCode: row.promo_code || '',
        banner: row.banner || '',
        thumbnail: row.thumbnail || '',
        applicableSports: typeof row.applicable_sports === 'string' ? JSON.parse(row.applicable_sports || '[]') : (row.applicable_sports || []),
        applicableDays: typeof row.applicable_days === 'string' ? JSON.parse(row.applicable_days || '[]') : (row.applicable_days || []),
        slotTypes: typeof row.slot_types === 'string' ? JSON.parse(row.slot_types || '[]') : (row.slot_types || []),
        startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : '',
        endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : '',
        startTime: row.start_time || '00:00:00',
        endTime: row.end_time || '23:59:59',
        usageLimit: Number(row.usage_limit || 100),
        usedCount: Number(row.used_count || 0),
        perUserLimit: Number(row.per_user_limit || 1),
        firstBookingOnly: Boolean(row.first_booking_only),
        stackable: Boolean(row.stackable),
        autoApply: Boolean(row.auto_apply),
        targetRadius: Number(row.target_radius || 5.0),
        location: row.location || '',
        targetCities: typeof row.target_cities === 'string' ? JSON.parse(row.target_cities || '[]') : (row.target_cities || []),
        gender: row.gender || 'All',
        ageGroup: row.age_group || 'All Ages',
        customerType: row.customer_type || 'All Users',
        estimatedAudience: Number(row.estimated_audience || 5000),
        status: row.status || 'Active',
        createdBy: row.created_by || 'SYSTEM',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
};

/**
 * GET /api/v1/discount-offers
 */
const getDiscountOffers = async (req, res) => {
    try {
        const { search, turfId, status, discountType, page = 1, limit = 10 } = req.query;

        let query = `
            SELECT d.*, b.name as turf_name, o.full_name as owner_name
            FROM discount_offers d
            LEFT JOIN branches b ON d.turf_id = b.id
            LEFT JOIN owners o ON d.owner_id = o.id
            WHERE d.deleted_at IS NULL
        `;
        const params = [];

        if (turfId && turfId !== 'ALL') {
            query += ` AND d.turf_id = ?`;
            params.push(turfId);
        }

        if (status && status !== 'ALL') {
            query += ` AND d.status = ?`;
            params.push(status);
        }

        if (discountType && discountType !== 'ALL') {
            query += ` AND d.discount_type = ?`;
            params.push(discountType);
        }

        if (search) {
            query += ` AND (LOWER(d.title) LIKE ? OR LOWER(d.promo_code) LIKE ? OR LOWER(b.name) LIKE ?)`;
            const q = `%${search.toLowerCase().trim()}%`;
            params.push(q, q, q);
        }

        query += ` ORDER BY d.created_at DESC`;

        const [rows] = await db.query(query, params);

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const total = rows.length;
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedRows = rows.slice(startIndex, startIndex + limitNum);
        const formattedOffers = paginatedRows.map(formatDiscountRow);

        return res.status(200).json({
            success: true,
            data: {
                offers: formattedOffers,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum) || 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching discount offers:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch discount offers',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/discount-offers/:id
 */
const getDiscountOfferById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(`
            SELECT d.*, b.name as turf_name, o.full_name as owner_name
            FROM discount_offers d
            LEFT JOIN branches b ON d.turf_id = b.id
            LEFT JOIN owners o ON d.owner_id = o.id
            WHERE d.id = ? AND d.deleted_at IS NULL
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Discount offer not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: formatDiscountRow(rows[0])
        });
    } catch (error) {
        console.error('Error fetching discount offer by id:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch discount offer details',
            error: error.message
        });
    }
};

/**
 * POST /api/v1/discount-offers
 */
const createDiscountOffer = async (req, res) => {
    try {
        const {
            ownerId,
            turfId,
            title,
            description,
            discountType,
            discountValue,
            minimumBookingAmount,
            maximumDiscountAmount,
            promoCode,
            applicableSports,
            applicableDays,
            slotTypes,
            startDate,
            endDate,
            startTime = '00:00:00',
            endTime = '23:59:59',
            usageLimit = 100,
            perUserLimit = 1,
            firstBookingOnly = false,
            stackable = false,
            autoApply = false,
            targetRadius = 5.0,
            location,
            targetCities,
            gender = 'All',
            ageGroup = 'All Ages',
            customerType = 'All Users',
            estimatedAudience = 5000,
            status = 'Active'
        } = req.body;

        // Process Promo Code uniqueness
        const code = promoCode ? promoCode.trim().toUpperCase() : null;
        if (code) {
            const [existing] = await db.query('SELECT id FROM discount_offers WHERE promo_code = ? AND deleted_at IS NULL', [code]);
            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: `Promo Code "${code}" is already in use. Please enter a unique code.`
                });
            }
        }

        // Process File Uploads
        let banner = '';
        let thumbnail = '';
        if (req.files) {
            if (req.files.banner && req.files.banner[0]) {
                banner = `/uploads/${req.files.banner[0].filename}`;
            }
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
            }
        }
        banner = banner || req.body.banner || '';
        thumbnail = thumbnail || req.body.thumbnail || '';

        const discountId = `disc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const sportsJson = JSON.stringify(Array.isArray(applicableSports) ? applicableSports : (applicableSports ? [applicableSports] : []));
        const daysJson = JSON.stringify(Array.isArray(applicableDays) ? applicableDays : (applicableDays ? [applicableDays] : []));
        const slotsJson = JSON.stringify(Array.isArray(slotTypes) ? slotTypes : (slotTypes ? [slotTypes] : []));
        const citiesJson = JSON.stringify(Array.isArray(targetCities) ? targetCities : (targetCities ? [targetCities] : []));

        const insertQuery = `
            INSERT INTO discount_offers (
                id, owner_id, turf_id, title, description, discount_type, discount_value,
                minimum_booking_amount, maximum_discount_amount, promo_code, banner, thumbnail,
                applicable_sports, applicable_days, slot_types, start_date, end_date, start_time, end_time,
                usage_limit, used_count, per_user_limit, first_booking_only, stackable, auto_apply,
                target_radius, location, target_cities, gender, age_group, customer_type,
                estimated_audience, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(insertQuery, [
            discountId,
            ownerId || null,
            turfId,
            title.trim(),
            description || '',
            discountType,
            discountValue,
            minimumBookingAmount || 0,
            maximumDiscountAmount || 0,
            code,
            banner,
            thumbnail,
            sportsJson,
            daysJson,
            slotsJson,
            startDate,
            endDate,
            startTime,
            endTime,
            usageLimit || 100,
            perUserLimit || 1,
            firstBookingOnly ? 1 : 0,
            stackable ? 1 : 0,
            autoApply ? 1 : 0,
            targetRadius || 5.0,
            location || '',
            citiesJson,
            gender || 'All',
            ageGroup || 'All Ages',
            customerType || 'All Users',
            estimatedAudience || 5000,
            status || 'Active',
            req.user?.id || 'SYSTEM'
        ]);

        const [created] = await db.query(`
            SELECT d.*, b.name as turf_name, o.full_name as owner_name
            FROM discount_offers d
            LEFT JOIN branches b ON d.turf_id = b.id
            LEFT JOIN owners o ON d.owner_id = o.id
            WHERE d.id = ?
        `, [discountId]);

        return res.status(201).json({
            success: true,
            message: 'Discount offer created successfully',
            data: formatDiscountRow(created[0])
        });

    } catch (error) {
        console.error('Error creating discount offer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create discount offer',
            error: error.message
        });
    }
};

/**
 * PUT /api/v1/discount-offers/:id
 */
const updateDiscountOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.query('SELECT id FROM discount_offers WHERE id = ? AND deleted_at IS NULL', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Discount offer not found' });
        }

        const updateData = req.body;
        const updates = [];
        const params = [];

        if (updateData.title) { updates.push('title = ?'); params.push(updateData.title.trim()); }
        if (updateData.description !== undefined) { updates.push('description = ?'); params.push(updateData.description); }
        if (updateData.discountType) { updates.push('discount_type = ?'); params.push(updateData.discountType); }
        if (updateData.discountValue !== undefined) { updates.push('discount_value = ?'); params.push(updateData.discountValue); }
        if (updateData.minimumBookingAmount !== undefined) { updates.push('minimum_booking_amount = ?'); params.push(updateData.minimumBookingAmount); }
        if (updateData.maximumDiscountAmount !== undefined) { updates.push('maximum_discount_amount = ?'); params.push(updateData.maximumDiscountAmount); }
        if (updateData.promoCode !== undefined) { updates.push('promo_code = ?'); params.push(updateData.promoCode.trim().toUpperCase()); }
        if (updateData.startDate) { updates.push('start_date = ?'); params.push(updateData.startDate); }
        if (updateData.endDate) { updates.push('end_date = ?'); params.push(updateData.endDate); }
        if (updateData.usageLimit !== undefined) { updates.push('usage_limit = ?'); params.push(updateData.usageLimit); }
        if (updateData.status) { updates.push('status = ?'); params.push(updateData.status); }

        if (updates.length > 0) {
            params.push(id);
            await db.query(`UPDATE discount_offers SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        const [updated] = await db.query(`
            SELECT d.*, b.name as turf_name, o.full_name as owner_name
            FROM discount_offers d
            LEFT JOIN branches b ON d.turf_id = b.id
            LEFT JOIN owners o ON d.owner_id = o.id
            WHERE d.id = ?
        `, [id]);

        return res.status(200).json({
            success: true,
            message: 'Discount offer updated successfully',
            data: formatDiscountRow(updated[0])
        });
    } catch (error) {
        console.error('Error updating discount offer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update discount offer',
            error: error.message
        });
    }
};

/**
 * DELETE /api/v1/discount-offers/:id
 */
const deleteDiscountOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE discount_offers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return res.status(200).json({
            success: true,
            message: 'Discount offer deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting discount offer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete discount offer',
            error: error.message
        });
    }
};

/**
 * PATCH /api/v1/discount-offers/:id/status
 */
const changeDiscountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required' });
        }

        await db.query('UPDATE discount_offers SET status = ? WHERE id = ?', [status, id]);
        return res.status(200).json({
            success: true,
            message: `Discount offer status changed to ${status}`
        });
    } catch (error) {
        console.error('Error changing discount offer status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

/**
 * POST /api/v1/discount-offers/:id/duplicate
 */
const duplicateDiscountOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM discount_offers WHERE id = ? AND deleted_at IS NULL', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Original discount offer not found' });
        }

        const original = rows[0];
        const newId = `disc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newTitle = `${original.title} (Copy)`;
        const newPromoCode = original.promo_code ? `${original.promo_code}_COPY_${Math.floor(Math.random() * 100)}` : null;

        const insertQuery = `
            INSERT INTO discount_offers (
                id, owner_id, turf_id, title, description, discount_type, discount_value,
                minimum_booking_amount, maximum_discount_amount, promo_code, banner, thumbnail,
                applicable_sports, applicable_days, slot_types, start_date, end_date, start_time, end_time,
                usage_limit, used_count, per_user_limit, first_booking_only, stackable, auto_apply,
                target_radius, location, target_cities, gender, age_group, customer_type,
                estimated_audience, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
        `;

        await db.query(insertQuery, [
            newId, original.owner_id, original.turf_id, newTitle, original.description,
            original.discount_type, original.discount_value, original.minimum_booking_amount,
            original.maximum_discount_amount, newPromoCode, original.banner, original.thumbnail,
            original.applicable_sports, original.applicable_days, original.slot_types,
            original.start_date, original.end_date, original.start_time, original.end_time,
            original.usage_limit, original.per_user_limit, original.first_booking_only,
            original.stackable, original.auto_apply, original.target_radius, original.location,
            original.target_cities, original.gender, original.age_group, original.customer_type,
            original.estimated_audience, req.user?.id || 'SYSTEM'
        ]);

        const [duplicated] = await db.query(`
            SELECT d.*, b.name as turf_name, o.full_name as owner_name
            FROM discount_offers d
            LEFT JOIN branches b ON d.turf_id = b.id
            LEFT JOIN owners o ON d.owner_id = o.id
            WHERE d.id = ?
        `, [newId]);

        return res.status(201).json({
            success: true,
            message: 'Discount offer duplicated successfully',
            data: formatDiscountRow(duplicated[0])
        });
    } catch (error) {
        console.error('Error duplicating discount offer:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to duplicate discount offer',
            error: error.message
        });
    }
};

module.exports = {
    getDiscountOffers,
    getDiscountOfferById,
    createDiscountOffer,
    updateDiscountOffer,
    deleteDiscountOffer,
    changeDiscountStatus,
    duplicateDiscountOffer
};
