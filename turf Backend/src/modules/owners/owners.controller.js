const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

/**
 * Save base64 image string to disk in public/uploads directory
 */
const saveBase64Image = (base64String, prefix = 'owner_profile') => {
    if (!base64String || typeof base64String !== 'string') return '';
    if (!base64String.startsWith('data:image/')) return base64String;

    try {
        const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) return base64String;

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const dataBuffer = Buffer.from(matches[2], 'base64');
        
        const uploadsDir = path.join(__dirname, '../../../public/uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, dataBuffer);
        return `/uploads/${filename}`;
    } catch (err) {
        console.error('Error saving base64 image:', err);
        return base64String;
    }
};

/**
 * Format owner database row into clean JSON object (excluding password_hash)
 */
const formatOwner = (r) => {
    if (!r) return null;
    return {
        id: r.id,
        _id: r.id,
        fullName: r.full_name,
        email: r.email,
        mobile: r.mobile,
        alternateMobile: r.alternate_mobile || '',
        status: r.status,
        businessName: r.business_name || '',
        businessType: r.business_type || '',
        gstNumber: r.gst_number || '',
        panNumber: r.pan_number || '',
        country: r.country || 'India',
        state: r.state || '',
        city: r.city || '',
        zipCode: r.zip_code || '',
        fullAddress: r.full_address || '',
        profileImage: r.profile_image || '',
        createdBy: r.created_by || '',
        updatedBy: r.updated_by || '',
        createdAt: r.created_at,
        updatedAt: r.updated_at
    };
};

/**
 * POST /api/v1/owners
 * Register a new Owner
 */
const createOwner = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const {
            fullName,
            email,
            mobile,
            alternateMobile,
            password,
            status = 'ACTIVE',
            businessName,
            businessType,
            gstNumber,
            panNumber,
            country = 'India',
            state,
            city,
            zipCode,
            fullAddress = req.body.fullAddress || req.body.address,
            createdBy
        } = req.body;

        const normalizedEmail = email ? email.toLowerCase().trim() : '';
        const normalizedMobile = mobile ? mobile.trim() : '';

        // 1. Check if email already exists
        const [existingEmail] = await conn.query('SELECT id FROM owners WHERE LOWER(email) = ?', [normalizedEmail]);
        if (existingEmail.length > 0) {
            conn.release();
            return res.status(409).json({
                success: false,
                message: 'An owner with this Email address already exists.'
            });
        }

        // 2. Check if mobile already exists
        const [existingMobile] = await conn.query('SELECT id FROM owners WHERE mobile = ?', [normalizedMobile]);
        if (existingMobile.length > 0) {
            conn.release();
            return res.status(409).json({
                success: false,
                message: 'An owner with this Mobile number already exists.'
            });
        }

        // 3. Process Profile Image upload if provided
        let profileImage = '';
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        } else if (req.body.profileImage) {
            profileImage = saveBase64Image(req.body.profileImage, 'owner');
        }

        // 4. Hash password securely
        const rawPassword = (password && password.trim()) ? password.trim() : 'password123';
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        // 5. Generate unique IDs
        const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const ownerId = `own_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // 6. Execute Transaction
        await conn.beginTransaction();

        // Sync into users table for authentication access
        try {
            await conn.query(
                `INSERT INTO users (id, name, email, password_hash, role, mobile, avatar, status) 
                 VALUES (?, ?, ?, ?, 'OWNER', ?, ?, ?)
                 ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), mobile = VALUES(mobile), status = VALUES(status)`,
                [userId, fullName.trim(), normalizedEmail, passwordHash, normalizedMobile, profileImage || null, status]
            );
        } catch (uErr) {
            console.warn('Sync to users table skipped:', uErr.message);
        }

        const insertQuery = `
            INSERT INTO owners (
                id, user_id, full_name, email, mobile, alternate_mobile, status,
                business_name, business_type, gst_number, pan_number,
                country, state, city, zip_code, full_address, profile_image,
                created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await conn.query(insertQuery, [
            ownerId,
            userId,
            fullName.trim(),
            normalizedEmail,
            normalizedMobile,
            alternateMobile ? alternateMobile.trim() : null,
            status,
            businessName ? businessName.trim() : null,
            businessType ? businessType.trim() : null,
            gstNumber ? gstNumber.trim() : null,
            panNumber ? panNumber.trim() : null,
            country ? country.trim() : 'India',
            state ? state.trim() : null,
            city ? city.trim() : null,
            zipCode ? zipCode.trim() : null,
            fullAddress ? fullAddress.trim() : null,
            profileImage || null,
            createdBy || req.user?.id || 'SYSTEM',
            createdBy || req.user?.id || 'SYSTEM'
        ]);

        await conn.commit();
        conn.release();

        // 7. Fetch newly inserted owner
        const [rows] = await db.query('SELECT * FROM owners WHERE id = ?', [ownerId]);
        const createdOwner = formatOwner(rows[0]);

        return res.status(201).json({
            success: true,
            message: 'Owner registered successfully',
            data: createdOwner
        });

    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('Error creating owner:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to register owner',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/owners
 * Get all owners with search, status filter, and pagination
 */
const getOwners = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        let sql = 'SELECT * FROM owners WHERE 1=1';
        const params = [];

        if (status && status !== 'ALL') {
            sql += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (full_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR business_name LIKE ? OR city LIKE ?)';
            const q = `%${search}%`;
            params.push(q, q, q, q, q);
        }

        const [countRows] = await db.query('SELECT COUNT(*) as count FROM owners');
        const count = countRows[0]?.count || 0;

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await db.query(sql, params);
        const owners = rows.map(formatOwner);

        return res.status(200).json({
            success: true,
            data: {
                owners,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching owners:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch owners',
            error: error.message
        });
    }
};

/**
 * GET /api/v1/owners/:id
 * Get single owner details by ID
 */
const getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM owners WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: formatOwner(rows[0])
        });
    } catch (error) {
        console.error('Error fetching owner details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch owner details',
            error: error.message
        });
    }
};

/**
 * PUT /api/v1/owners/:id
 * Update owner information
 */
const updateOwner = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;

        // Check if owner exists
        const [existing] = await conn.query('SELECT * FROM owners WHERE id = ?', [id]);
        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        const currentOwner = existing[0];
        const fullAddress = req.body.fullAddress || req.body.address;
        const {
            fullName,
            email,
            mobile,
            alternateMobile,
            password,
            status,
            businessName,
            businessType,
            gstNumber,
            panNumber,
            country,
            state,
            city,
            zipCode,
            updatedBy
        } = req.body;

        // 1. Email uniqueness check if changed
        if (email && email.toLowerCase().trim() !== currentOwner.email.toLowerCase()) {
            const [emailCheck] = await conn.query('SELECT id FROM owners WHERE LOWER(email) = ? AND id != ?', [email.toLowerCase().trim(), id]);
            if (emailCheck.length > 0) {
                conn.release();
                return res.status(409).json({
                    success: false,
                    message: 'Email address is already in use by another owner.'
                });
            }
        }

        // 2. Mobile uniqueness check if changed
        if (mobile && mobile.trim() !== currentOwner.mobile) {
            const [mobileCheck] = await conn.query('SELECT id FROM owners WHERE mobile = ? AND id != ?', [mobile.trim(), id]);
            if (mobileCheck.length > 0) {
                conn.release();
                return res.status(409).json({
                    success: false,
                    message: 'Mobile number is already in use by another owner.'
                });
            }
        }

        // 3. Process Profile Image update
        let profileImage = currentOwner.profile_image;
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        } else if (req.body.profileImage !== undefined) {
            profileImage = saveBase64Image(req.body.profileImage, 'owner');
        }

        // 4. Process Password hash update if provided
        let passwordHash = currentOwner.password_hash;
        if (password && password.trim().length >= 6) {
            passwordHash = await bcrypt.hash(password.trim(), 10);
        }

        // 5. Execute Update Transaction
        await conn.beginTransaction();

        const updateQuery = `
            UPDATE owners SET
                full_name = ?,
                email = ?,
                mobile = ?,
                alternate_mobile = ?,
                password_hash = ?,
                status = ?,
                business_name = ?,
                business_type = ?,
                gst_number = ?,
                pan_number = ?,
                country = ?,
                state = ?,
                city = ?,
                zip_code = ?,
                full_address = ?,
                profile_image = ?,
                updated_by = ?
            WHERE id = ?
        `;

        await conn.query(updateQuery, [
            fullName !== undefined ? fullName.trim() : currentOwner.full_name,
            email !== undefined ? email.toLowerCase().trim() : currentOwner.email,
            mobile !== undefined ? mobile.trim() : currentOwner.mobile,
            alternateMobile !== undefined ? (alternateMobile ? alternateMobile.trim() : null) : currentOwner.alternate_mobile,
            passwordHash,
            status !== undefined ? status : currentOwner.status,
            businessName !== undefined ? (businessName ? businessName.trim() : null) : currentOwner.business_name,
            businessType !== undefined ? (businessType ? businessType.trim() : null) : currentOwner.business_type,
            gstNumber !== undefined ? (gstNumber ? gstNumber.trim() : null) : currentOwner.gst_number,
            panNumber !== undefined ? (panNumber ? panNumber.trim() : null) : currentOwner.pan_number,
            country !== undefined ? (country ? country.trim() : 'India') : currentOwner.country,
            state !== undefined ? (state ? state.trim() : null) : currentOwner.state,
            city !== undefined ? (city ? city.trim() : null) : currentOwner.city,
            zipCode !== undefined ? (zipCode ? zipCode.trim() : null) : currentOwner.zip_code,
            fullAddress !== undefined ? (fullAddress ? fullAddress.trim() : null) : currentOwner.full_address,
            profileImage,
            updatedBy || req.user?.id || 'SYSTEM',
            id
        ]);

        // Also sync update to users table
        try {
            await conn.query(
                `UPDATE users SET 
                    name = ?, 
                    email = ?, 
                    mobile = ?, 
                    password_hash = ?,
                    status = ?,
                    avatar = ?
                 WHERE id = ? OR LOWER(email) = ?`,
                [
                    fullName !== undefined ? fullName.trim() : currentOwner.full_name,
                    email !== undefined ? email.toLowerCase().trim() : currentOwner.email,
                    mobile !== undefined ? mobile.trim() : currentOwner.mobile,
                    passwordHash,
                    status !== undefined ? status : currentOwner.status,
                    profileImage || null,
                    id,
                    currentOwner.email.toLowerCase()
                ]
            );
        } catch (uErr) {
            console.warn('Sync to users table skipped on update:', uErr.message);
        }

        await conn.commit();
        conn.release();

        // 6. Return updated object
        const [updatedRows] = await db.query('SELECT * FROM owners WHERE id = ?', [id]);
        return res.status(200).json({
            success: true,
            message: 'Owner updated successfully',
            data: formatOwner(updatedRows[0])
        });

    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('Error updating owner:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update owner',
            error: error.message
        });
    }
};

/**
 * PATCH /api/v1/owners/:id/status
 * Change Owner Status (ACTIVE / INACTIVE / SUSPENDED)
 */
const changeOwnerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (ACTIVE, INACTIVE, SUSPENDED).'
            });
        }

        const [existing] = await db.query('SELECT id, email FROM owners WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        await db.query('UPDATE owners SET status = ?, updated_by = ? WHERE id = ?', [
            status,
            req.user?.id || 'SYSTEM',
            id
        ]);

        try {
            await db.query('UPDATE users SET status = ? WHERE id = ? OR LOWER(email) = ?', [
                status,
                id,
                existing[0].email.toLowerCase()
            ]);
        } catch (uErr) {
            console.warn('Sync user status skipped:', uErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Owner status updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating owner status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update owner status',
            error: error.message
        });
    }
};

/**
 * DELETE /api/v1/owners/:id
 * Delete Owner
 */
const deleteOwner = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;

        const [existing] = await conn.query('SELECT id, email FROM owners WHERE id = ?', [id]);
        if (existing.length === 0) {
            conn.release();
            return res.status(404).json({
                success: false,
                message: 'Owner not found'
            });
        }

        await conn.beginTransaction();

        try {
            await conn.query('DELETE FROM users WHERE id = ? OR LOWER(email) = ?', [
                id,
                existing[0].email.toLowerCase()
            ]);
        } catch (uErr) {
            console.warn('Delete from users table skipped:', uErr.message);
        }

        await conn.query('DELETE FROM owners WHERE id = ?', [id]);
        await conn.commit();
        conn.release();

        return res.status(200).json({
            success: true,
            message: 'Owner deleted successfully'
        });
    } catch (error) {
        await conn.rollback();
        conn.release();
        console.error('Error deleting owner:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete owner',
            error: error.message
        });
    }
};

module.exports = {
    createOwner,
    getOwners,
    getOwnerById,
    updateOwner,
    changeOwnerStatus,
    deleteOwner
};
