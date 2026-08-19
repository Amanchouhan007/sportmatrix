const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 */
const register = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required fields.'
        });
    }

    try {
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userId = 'usr_' + Date.now();
        const userRole = role || 'CUSTOMER';

        await db.query(
            'INSERT INTO users (id, name, email, password_hash, role, mobile, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, email, passwordHash, userRole, phone || null, 'ACTIVE']
        );

        const walletId = 'wal_' + Date.now();
        await db.query('INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, 0)', [walletId, userId]);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                userId,
                name,
                email,
                role: userRole
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error during registration.'
        });
    }
};

/**
 * Login user with flexible password comparison (bcrypt + plain text + dev fallbacks)
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.'
        });
    }

    try {
        let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        let user;

        if (users.length === 0) {
            // Check in owners table if created via plan registration
            const [owners] = await db.query('SELECT * FROM owners WHERE email = ?', [email]);
            if (owners.length > 0) {
                const owner = owners[0];
                let isMatch = false;

                if (owner.password_hash === password) {
                    isMatch = true;
                } else if (owner.password_hash && owner.password_hash.startsWith('$2')) {
                    try { isMatch = await bcrypt.compare(password, owner.password_hash); } catch (e) { }
                } else {
                    try { isMatch = await bcrypt.compare(password, owner.password_hash); } catch (e) { }
                }

                // Dev/fallback matching for quick testing
                if (!isMatch && (password === '123456' || password === '123' || password === 'admin')) {
                    isMatch = true;
                }

                if (!isMatch) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials. Incorrect password.'
                    });
                }

                // Sync into users table for seamless system login
                const userId = owner.id || ('usr_' + Date.now());
                try {
                    await db.query(
                        'INSERT INTO users (id, name, email, password_hash, role, mobile, alternate_mobile, avatar, status) VALUES (?, ?, ?, ?, "OWNER", ?, ?, ?, "ACTIVE") ON DUPLICATE KEY UPDATE name = VALUES(name), mobile = VALUES(mobile)',
                        [userId, owner.full_name, owner.email, owner.password_hash, owner.mobile, owner.alternate_mobile || null, owner.profile_image || null]
                    );
                } catch (e) { }

                user = {
                    id: userId,
                    name: owner.full_name,
                    email: owner.email,
                    role: 'OWNER',
                    mobile: owner.mobile,
                    alternate_mobile: owner.alternate_mobile || '',
                    avatar: owner.profile_image || '',
                    status: owner.status || 'ACTIVE'
                };
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials. User not found.'
                });
            }
        } else {
            user = users[0];
            let isMatch = false;

            if (user.password_hash === password) {
                isMatch = true;
            } else if (user.password_hash && user.password_hash.startsWith('$2')) {
                try { isMatch = await bcrypt.compare(password, user.password_hash); } catch (e) { }
            } else {
                try { isMatch = await bcrypt.compare(password, user.password_hash); } catch (e) { }
            }

            // Dev/fallback matching for quick testing
            if (!isMatch && (password === '123456' || password === '123' || password === 'admin')) {
                isMatch = true;
            }

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials. Incorrect password.'
                });
            }
        }

        if (user.status === 'INACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.'
            });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'OWNER',
                mobile: user.mobile,
                alternateMobile: user.alternate_mobile || '',
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error during login.'
        });
    }
};

/**
 * Logout User
 */
const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

/**
 * Get current user profile details
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userEmail = req.user?.email || 'superadmin@gmail.com';

        try {
            await db.query(`ALTER TABLE users ADD COLUMN alternate_mobile VARCHAR(20);`);
        } catch (e) { }

        const [users] = await db.query(
            'SELECT id, name, email, role, mobile, alternate_mobile, avatar, status, created_at FROM users WHERE id = ? OR email = ? OR role = "SUPER_ADMIN"',
            [userId || '', userEmail]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found.'
            });
        }

        const u = users[0];
        return res.status(200).json({
            success: true,
            data: {
                id: u.id,
                _id: u.id,
                fullName: u.name,
                name: u.name,
                email: u.email,
                role: u.role,
                mobile: u.mobile || '',
                alternateMobile: u.alternate_mobile || '',
                profileImage: u.avatar || ''
            }
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching profile.'
        });
    }
};

/**
 * Update current user profile details
 */
const updateProfile = async (req, res) => {
    const { fullName, name, email, mobile, alternateMobile, profileImage } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email || email || 'superadmin@gmail.com';

    try {
        try {
            await db.query(`ALTER TABLE users ADD COLUMN alternate_mobile VARCHAR(20);`);
        } catch (e) { }
        try {
            await db.query(`ALTER TABLE users MODIFY COLUMN avatar LONGTEXT;`);
        } catch (e) { }
        try {
            await db.query(`ALTER TABLE owners MODIFY COLUMN profile_image LONGTEXT;`);
        } catch (e) { }

        const displayName = (fullName || name || '').trim();
        const displayMobile = mobile ? mobile.trim() : null;
        const displayAltMobile = alternateMobile ? alternateMobile.trim() : null;

        await db.query(
            'UPDATE users SET name = ?, mobile = ?, alternate_mobile = ?, avatar = ? WHERE id = ? OR email = ? OR role = "SUPER_ADMIN"',
            [displayName, displayMobile, displayAltMobile, profileImage || null, userId || '', userEmail]
        );

        try {
            await db.query(
                'UPDATE owners SET full_name = ?, mobile = ?, alternate_mobile = ?, profile_image = ? WHERE email = ? OR id = ?',
                [displayName, displayMobile, displayAltMobile, profileImage || null, userEmail, userId || '']
            );
        } catch (e) {
            console.warn('Sync owner profile update note:', e.message);
        }

        const [updatedUsers] = await db.query(
            'SELECT id, name, email, role, mobile, alternate_mobile, avatar, status FROM users WHERE id = ? OR email = ? OR role = "SUPER_ADMIN"',
            [userId || '', userEmail]
        );

        const updated = updatedUsers[0] || {};

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: updated.id,
                _id: updated.id,
                name: updated.name,
                fullName: updated.name,
                email: updated.email,
                role: updated.role,
                mobile: updated.mobile,
                alternateMobile: updated.alternate_mobile || '',
                profileImage: updated.avatar
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating profile: ' + error.message
        });
    }
};

/**
 * Change current user password
 */
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email || 'superadmin@gmail.com';

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long.'
        });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ? OR email = ? OR role = "SUPER_ADMIN"', [userId || '', userEmail]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = users[0];

        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect.'
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ? OR email = ? OR role = "SUPER_ADMIN"', [newPasswordHash, userId || '', userEmail]);

        try {
            await db.query('UPDATE owners SET password_hash = ? WHERE email = ? OR id = ?', [newPasswordHash, userEmail, userId || '']);
        } catch (e) {
            console.warn('Sync owner password update note:', e.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error changing password: ' + error.message
        });
    }
};

/**
 * Get all users across the platform (Super Admin User Management)
 */
const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        let query = `SELECT id, name, email, role, mobile, status, created_at, updated_at FROM users WHERE 1=1`;
        const params = [];

        if (role && role !== 'ALL') {
            query += ` AND role = ?`;
            params.push(role);
        }

        if (status && status !== 'ALL') {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (search) {
            query += ` AND (name LIKE ? OR email LIKE ? OR mobile LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        query += ` ORDER BY created_at DESC`;

        const [users] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                mobile: u.mobile,
                status: u.status,
                joined: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
            }))
        });
    } catch (error) {
        console.error('Fetch all users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching users: ' + error.message
        });
    }
};

/**
 * Toggle or update user status (ACTIVE / SUSPENDED / INACTIVE)
 */
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const normalizedStatus = status.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';

        const [result] = await db.query('UPDATE users SET status = ? WHERE id = ?', [normalizedStatus, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: `User status updated to ${normalizedStatus}`,
            data: { id, status: normalizedStatus }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating user status: ' + error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserStatus
};
