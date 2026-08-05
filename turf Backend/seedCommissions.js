const db = require('./src/config/db');

async function seedCommissionsData() {
    try {
        await db.query('DELETE FROM commissions');
        await db.query(`
            INSERT INTO commissions (booking_id, ad_id, ad_name, turf_name, booking_amount, commission_rate, commission_amount, owner_amount, invoice_no, payment_status, created_at) VALUES 
            ('BK-9021', 'AD-1001', 'Champions Night Drive', 'Champions Turf Arena', 3500, 12, 420, 3080, 'INV-2026-001', 'Pending', NOW()),
            ('BK-9022', 'AD-1002', 'Monsoon 25% Off', 'SkyLine Football Turf', 2400, 10, 240, 2160, 'INV-2026-002', 'Paid', NOW()),
            ('BK-9023', 'AD-1003', 'Banner Impression Push', 'Velocity Sports Hub', 5000, 15, 750, 4250, 'INV-2026-003', 'Pending', NOW()),
            ('BK-9024', 'AD-1004', 'Weekday Discount', 'GreenField Box Cricket', 1800, 8, 144, 1656, 'INV-2026-004', 'Paid', NOW()),
            ('BK-9025', 'AD-1005', 'Guaranteed Tournament Slot', 'Apex Turf & Arena', 6200, 14, 868, 5332, 'INV-2026-005', 'Pending', NOW())
        `);

        console.log('Successfully seeded 5 dynamic commission records into MySQL turf_db!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding commission data:', err);
        process.exit(1);
    }
}

seedCommissionsData();
