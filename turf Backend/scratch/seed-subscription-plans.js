const db = require('../src/config/db');

async function seedPlans() {
    try {
        console.log('Seeding Subscription Plans into MySQL database...');
        
        await db.query(`
            INSERT INTO subscription_plans (
                id, plan_name, description, is_popular, status,
                monthly_price, monthly_branch_limit, monthly_sports_limit, monthly_booking_limit, monthly_active_users_limit,
                yearly_price, yearly_branch_limit, yearly_sports_limit, yearly_booking_limit, yearly_active_users_limit,
                features
            ) VALUES 
            (
                'plan_starter', 'Starter Plan', 'Ideal for single turf owners getting started.', 0, 'active',
                999, 1, 2, 200, 5,
                9999, 1, 2, 2500, 5,
                '["Online Slot Booking", "Basic Analytics", "Email Notifications", "Standard Support"]'
            ),
            (
                'plan_pro', 'Professional Plan', 'Perfect for growing multi-turf sports complexes.', 1, 'active',
                2499, 5, 6, 1000, 20,
                24999, 5, 6, 15000, 20,
                '["All Starter Features", "Multi-Branch Management", "Advanced Analytics & Exports", "POS Integration", "Priority 24/7 Support"]'
            ),
            (
                'plan_enterprise', 'Enterprise Arena', 'Custom tailored plan for large stadium & turf networks.', 0, 'active',
                4999, 20, 15, 10000, 100,
                49999, 20, 15, 120000, 100,
                '["Unlimited Branches", "Dedicated Account Manager", "Custom Billing Integrations", "White Label Branding", "SLA Guarantee"]'
            )
            ON DUPLICATE KEY UPDATE 
                status = 'active',
                monthly_price = VALUES(monthly_price),
                yearly_price = VALUES(yearly_price);
        `);

        console.log('SUCCESS: Starter Plan, Professional Plan, and Enterprise Arena saved to MySQL database!');
    } catch (err) {
        console.error('SEED ERROR:', err);
    } finally {
        process.exit(0);
    }
}

seedPlans();
