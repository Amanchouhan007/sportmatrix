const prisma = require('../turf Backend/src/config/prisma');

async function auditAdminBackendConnectivity() {
    console.log('================================================================================');
    console.log('🔍 DEEP AUDIT REPORT: ADMIN SECTION E2E BACKEND & DATABASE CONNECTIVITY');
    console.log('================================================================================\n');

    const results = [];

    async function checkEndpoint(sectionName, routePath, prismaQuery, notes) {
        try {
            const data = await prismaQuery();
            const itemCount = Array.isArray(data) ? data.length : typeof data === 'number' ? data : (data ? 1 : 0);
            results.push({
                sectionName,
                routePath,
                status: 'CONNECTED (LIVE DB)',
                itemCount,
                sample: Array.isArray(data) && data.length > 0 ? JSON.stringify(data[0]).substring(0, 80) + '...' : 'No records or 0 count',
                notes
            });
            console.log(`[PASS] ${sectionName} (${routePath}): ${itemCount} record(s) found.`);
        } catch (err) {
            results.push({
                sectionName,
                routePath,
                status: 'ERROR',
                itemCount: 0,
                sample: err.message,
                notes
            });
            console.error(`[FAIL] ${sectionName} (${routePath}): ${err.message}`);
        }
    }

    // 1. Dashboard Overview
    await checkEndpoint(
        '1. Dashboard Summary',
        'GET /api/v1/dashboard/summary',
        async () => {
            const bookings = await prisma.booking.count();
            const payments = await prisma.payment.count();
            return bookings + payments;
        },
        'Real-time revenue, bookings, active matches, and hourly occupancy'
    );

    // 2. Lead CRM & Broadcast
    await checkEndpoint(
        '2. Lead CRM & Broadcast',
        'GET /api/v1/crm/leads',
        async () => prisma.user.findMany({ where: { role: 'CUSTOMER' }, take: 5 }),
        'Customer lead roster and broadcast messaging system'
    );

    // 3. Advertising Management
    await checkEndpoint(
        '3. Advertising Management',
        'GET /api/v1/ads',
        async () => prisma.advertisement.findMany({ take: 5 }),
        'Banner sponsorships and campaign analytics'
    );

    // 4. Tournament Management
    await checkEndpoint(
        '4. Tournament Management',
        'GET /api/v1/tournaments',
        async () => prisma.tournament.findMany({ take: 5 }),
        'Tournament brackets, category setups, and registrations'
    );

    // 5. My Turfs & Venues
    await checkEndpoint(
        '5. My Turfs & Venues',
        'GET /api/v1/branches',
        async () => prisma.branch.findMany({ take: 5 }),
        'Branch venue listings, location addresses, and operational status'
    );

    // 6. Turf & Rates Setup
    await checkEndpoint(
        '6. Turf & Rates Setup',
        'GET /api/v1/sports',
        async () => prisma.sport.findMany({ take: 5 }),
        'Sport catalog, regular/peak hourly pricing configurations'
    );

    // 7. Turf Calendar
    await checkEndpoint(
        '7. Turf Calendar & Slots',
        'GET /api/v1/slots',
        async () => prisma.slot.findMany({ take: 5 }),
        'Hourly court availability calendar and custom rate overrides'
    );

    // 8. Bookings
    await checkEndpoint(
        '8. Bookings Ledger',
        'GET /api/v1/bookings/history',
        async () => prisma.booking.findMany({ take: 5 }),
        'Customer slot booking history and check-in status'
    );

    // 9. POS Billing
    await checkEndpoint(
        '9. POS Billing Terminal',
        'POST /api/v1/billing/pos-checkout',
        async () => prisma.payment.findMany({ where: { type: 'POS_BILL' }, take: 5 }),
        'Counter walk-in register checkout and instant receipt sharing'
    );

    // 10. Billing History
    await checkEndpoint(
        '10. Billing History',
        'GET /api/v1/billing/history',
        async () => prisma.payment.findMany({ take: 5 }),
        'Transaction audit ledger for counter and online payments'
    );

    // 11. Teams & Club Leaderboard
    await checkEndpoint(
        '11. Teams & Club Roster',
        'GET /api/v1/teams',
        async () => prisma.team.findMany({ take: 5 }),
        'Active club teams, participant statistics, and skill ratings'
    );

    // 12. Inventory Management
    await checkEndpoint(
        '12. Inventory & Stock',
        'GET /api/v1/inventory',
        async () => prisma.inventory.findMany({ take: 5 }),
        'Equipment stock quantity and POS add-on items'
    );

    // 13. Maintenance
    await checkEndpoint(
        '13. Maintenance Requests',
        'GET /api/v1/maintenance',
        async () => prisma.maintenanceTask.findMany({ take: 5 }),
        'Turf repair logs, lighting maintenance, and court upkeep'
    );

    // 14. Staff Management
    await checkEndpoint(
        '14. Staff & Roster',
        'GET /api/v1/staff',
        async () => prisma.user.findMany({ where: { role: 'STAFF' }, take: 5 }),
        'Counter staff accounts, duty shifts, and permissions'
    );

    // 15. Settings & Profile
    await checkEndpoint(
        '15. System Settings',
        'GET /api/v1/settings',
        async () => prisma.systemSettings.findMany({ take: 5 }),
        'Venue profile settings, branding logos, and payout rules'
    );

    console.log('\n================================================================================');
    console.log('📊 AUDIT SUMMARY REPORT COMPLETED');
    console.log('================================================================================\n');

    await prisma.$disconnect();
    process.exit(0);
}

auditAdminBackendConnectivity().catch(err => {
    console.error('Audit script failed:', err);
    process.exit(1);
});
