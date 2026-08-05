const db = require('./src/config/db');

async function seedDashboardData() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Ensure slots exist
        await db.query(`
            INSERT INTO slots (id, branch_id, sport_id, court_name, slot_date, start_time, end_time, duration, status) VALUES 
            ('slot_demo_01', 'br_001', 'sp_master_01', 'Turf A', ?, '10:00:00', '11:00:00', 60, 'BOOKED'),
            ('slot_demo_02', 'br_001', 'sp_master_02', 'Turf B', ?, '11:30:00', '12:30:00', 60, 'BOOKED'),
            ('slot_demo_03', 'br_001', 'sp_master_02', 'Court 1', ?, '14:00:00', '15:00:00', 60, 'AVAILABLE'),
            ('slot_demo_04', 'br_001', 'sp_master_01', 'Turf A', ?, '16:30:00', '17:30:00', 60, 'BOOKED')
            ON DUPLICATE KEY UPDATE court_name = VALUES(court_name), start_time = VALUES(start_time)
        `, [today, today, today, today]);

        // 2. Clear old bookings and insert dynamic bookings
        await db.query('DELETE FROM bookings');
        await db.query(`
            INSERT INTO bookings (id, slot_id, customer_name, mobile_number, amount, duration, status, created_at) VALUES 
            (1, 'slot_demo_01', 'Rahul K.', '+91 98765 11111', 800, 60, 'CONFIRMED', NOW()),
            (2, 'slot_demo_02', 'Priya S.', '+91 98765 22222', 900, 60, 'CONFIRMED', NOW()),
            (3, 'slot_demo_03', 'Arjun M.', '+91 98765 33333', 400, 60, 'PENDING', NOW()),
            (4, 'slot_demo_04', 'Sneha R.', '+91 98765 44444', 1200, 60, 'CONFIRMED', NOW())
        `);

        console.log('Successfully seeded 4 dynamic slots & bookings in MySQL turf_db!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding dashboard data:', err);
        process.exit(1);
    }
}

seedDashboardData();
