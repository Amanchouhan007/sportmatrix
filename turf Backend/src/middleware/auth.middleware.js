const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT Token
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access Denied: No Token Provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Access Denied: Invalid or Expired Token'
        });
    }
};

/**
 * Middleware to authorize based on user role(s)
 * @param {string[]} allowedRoles - List of authorized roles
 */
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User Role Not Found'
            });
        }

        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`
            });
        }

        next();
    };
};

/**
 * Optional JWT Token middleware (does not reject if missing)
 */
const optionalToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026');
            req.user = decoded;
        } catch (error) {
            // Token invalid, proceed as guest
        }
    }
    next();
};

module.exports = {
    verifyToken,
    optionalToken,
    authorizeRoles
};
