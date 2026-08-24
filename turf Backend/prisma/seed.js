/**
 * Prisma reference-data seed. Only ever seeds legitimate platform reference/config
 * data (master sports list, subscription plan catalog, system settings, and the
 * bootstrap Super Admin account) -- never fake business data like demo turfs,
 * bookings, or testimonials. Safe to re-run (idempotent upserts).
 *
 * Run with: npx prisma db seed
 */
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function main() {
    // 1. Bootstrap Super Admin account
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com';
    const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
    if (!existingSuperAdmin) {
        const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || '123456', 10);
        await prisma.user.create({
            data: {
                id: 'usr_superadmin_01',
                name: 'Super Administrator',
                email: superAdminEmail,
                passwordHash,
                role: 'SUPER_ADMIN',
                mobile: '+91 98765 43210',
                status: 'ACTIVE'
            }
        });
        console.log(`[seed] Created bootstrap Super Admin account (${superAdminEmail}). Change this password immediately in production.`);
    } else {
        console.log('[seed] Super Admin account already exists, skipping.');
    }

    // 2. Master sports catalog
    const masterSports = [
        { id: 'sp_master_01', name: 'Football', icon: '⚽', category: 'Team Sport' },
        { id: 'sp_master_02', name: 'Cricket', icon: '🏏', category: 'Team Sport' },
        { id: 'sp_master_03', name: 'Badminton', icon: '🏸', category: 'Racquet' },
        { id: 'sp_master_04', name: 'Basketball', icon: '🏀', category: 'Team Sport' },
        { id: 'sp_master_05', name: 'Tennis', icon: '🎾', category: 'Racquet' }
    ];
    for (const sport of masterSports) {
        await prisma.sport.upsert({
            where: { name: sport.name },
            update: {},
            create: { ...sport, defaultSlotDuration: 60 }
        });
    }
    console.log('[seed] Master sports catalog verified.');

    // 3. Subscription plan catalog
    const plans = [
        {
            id: 'plan_starter', planName: 'Starter Plan', description: 'Ideal for single turf owners getting started.',
            isPopular: false, monthlyPrice: 999, monthlyBranchLimit: 1, monthlySportsLimit: 2, monthlyBookingLimit: 200, monthlyActiveUsersLimit: 5,
            yearlyPrice: 9999, yearlyBranchLimit: 1, yearlySportsLimit: 2, yearlyBookingLimit: 2500, yearlyActiveUsersLimit: 5,
            features: ['Online Slot Booking', 'Basic Analytics', 'Email Notifications', 'Standard Support']
        },
        {
            id: 'plan_pro', planName: 'Professional Plan', description: 'Perfect for growing multi-turf sports complexes.',
            isPopular: true, monthlyPrice: 2499, monthlyBranchLimit: 5, monthlySportsLimit: 6, monthlyBookingLimit: 1000, monthlyActiveUsersLimit: 20,
            yearlyPrice: 24999, yearlyBranchLimit: 5, yearlySportsLimit: 6, yearlyBookingLimit: 15000, yearlyActiveUsersLimit: 20,
            features: ['All Starter Features', 'Multi-Branch Management', 'Advanced Analytics & Exports', 'POS Integration', 'Priority 24/7 Support']
        },
        {
            id: 'plan_enterprise', planName: 'Enterprise Arena', description: 'Custom tailored plan for large stadium & turf networks.',
            isPopular: false, monthlyPrice: 4999, monthlyBranchLimit: 20, monthlySportsLimit: 15, monthlyBookingLimit: 10000, monthlyActiveUsersLimit: 100,
            yearlyPrice: 49999, yearlyBranchLimit: 20, yearlySportsLimit: 15, yearlyBookingLimit: 120000, yearlyActiveUsersLimit: 100,
            features: ['Unlimited Branches', 'Dedicated Account Manager', 'Custom Billing Integrations', 'White Label Branding', 'SLA Guarantee']
        }
    ];
    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({ where: { id: plan.id }, update: {}, create: plan });
    }
    console.log('[seed] Subscription plan catalog verified.');

    // 4. Global system settings singleton
    await prisma.systemSetting.upsert({
        where: { id: 'global_commission' },
        update: {},
        create: {
            id: 'global_commission',
            defaultRate: 5.0,
            maxRate: 15.0,
            minRate: 2.0,
            sportsRates: { Football: 5, Cricket: 5, Badminton: 4, Tennis: 4.5 }
        }
    });

    // 5. Global tournament settings singleton
    await prisma.tournamentSetting.upsert({
        where: { id: 'global_tournament_settings' },
        update: {},
        create: { id: 'global_tournament_settings' }
    });

    console.log('[seed] System settings verified.');
}

main()
    .catch((e) => {
        console.error('[seed] Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
