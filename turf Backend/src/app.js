const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static folder for uploaded files/images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Auth Routes registration
const authRouter = require('./modules/auth/auth.routes');
app.use('/api/v1/auth', authRouter);

// Sports Routes registration
const sportsRouter = require('./modules/sports/sports.routes');
app.use('/api/v1/sports', sportsRouter);

// Slots Routes registration
const slotsRouter = require('./modules/slots/slots.routes');
app.use('/api/v1/slots', slotsRouter);

// Bookings Routes registration
const bookingsRouter = require('./modules/bookings/bookings.routes');
app.use('/api/v1/bookings', bookingsRouter);

// Billing Routes registration
const billingRouter = require('./modules/billing/billing.routes');
app.use('/api/v1/billing', billingRouter);

// Tournaments Routes registration
const tournamentsRouter = require('./modules/tournaments/tournaments.routes');
app.use('/api/v1/tournaments', tournamentsRouter);

// Wallet Routes registration
const walletRouter = require('./modules/wallet/wallet.routes');
app.use('/api/v1/wallet', walletRouter);

// Inventory Routes registration
const inventoryRouter = require('./modules/inventory/inventory.routes');
app.use('/api/v1/inventory', inventoryRouter);

// Reports Routes registration
const reportsRouter = require('./modules/reports/reports.routes');
app.use('/api/v1/reports', reportsRouter);

// Dashboard Routes registration
const dashboardRouter = require('./modules/dashboard/dashboard.routes');
app.use('/api/v1/dashboard', dashboardRouter);

// Branches Routes registration
const branchesRouter = require('./modules/branches/branches.routes');
app.use('/api/v1/branches', branchesRouter);

// Holidays Routes registration
const holidaysRouter = require('./modules/holidays/holidays.routes');
app.use('/api/v1/holidays', holidaysRouter);

// Turfs Routes registration
const turfsRouter = require('./modules/turfs/turfs.routes');
app.use('/api/v1/turfs', turfsRouter);

// Basic Root Health Check Route
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SportMatrix API server is healthy and running.'
    });
});

// Global 404 Route handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
});

// Global 500 Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
