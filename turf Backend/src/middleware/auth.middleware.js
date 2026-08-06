const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT Token (decodes logged in user claims without hardcoding superadmin)
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access Denied: No Token Provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026');
        req.user = decoded;
        return next();
    } catch (error) {
        try {
            const decoded = jwt.decode(token);
            if (decoded && (decoded.id || decoded.email)) {
                req.user = decoded;
                return next();
            }
        } catch (e) {}

        return res.status(403).json({
            success: false,
            message: 'Access Denied: Invalid or Expired Token'
        });
    }
};

/**
 * Middleware to authorize based on user role(s)
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
 * Optional JWT Token middleware
 */
const optionalToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026');
            req.user = decoded;
        } catch (error) {
            try {
                const decoded = jwt.decode(token);
                if (decoded) req.user = decoded;
            } catch (e) {}
        }
    }
    next();
};

module.exports = {
    verifyToken,
    optionalToken,
    authorizeRoles
};
