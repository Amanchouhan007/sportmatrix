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
        // 1. Check if user already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Generate User ID
        const userId = 'usr_' + Date.now();
        const userRole = role || 'CUSTOMER'; // Default role is customer

        // 4. Save User to DB
        await db.query(
            'INSERT INTO users (id, name, email, password_hash, role, mobile, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, email, passwordHash, userRole, phone || null, 'ACTIVE']
        );

        // 5. Initialize Wallet for new user
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
 * Login user
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
        // 1. Fetch user from DB
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User not found.'
            });
        }

        const user = users[0];

        if (user.status === 'INACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.'
            });
        }

        // 2. Verify Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. Incorrect password.'
            });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // 4. Send Response compatible with Frontend AuthContext.jsx
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                _id: user.id, // Support both formats
                name: user.name,
                email: user.email,
                role: user.role,
                mobile: user.mobile,
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
        const [users] = await db.query(
            'SELECT id, name, email, role, mobile, avatar, status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Fetch profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error fetching profile.'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile
};
