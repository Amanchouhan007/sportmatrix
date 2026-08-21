const prisma = require('../src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting Prisma Database Seeding...');

  const salt = await bcrypt.genSalt(10);
  const hash123456 = await bcrypt.hash('123456', salt);
  const hash123 = await bcrypt.hash('123', salt);

  // 1. Subscription Plans
  console.log('  ➜ Seeding Subscription Plans...');
  await prisma.subscriptionPlan.upsert({
    where: { id: 'plan_starter' },
    update: {},
    create: {
      id: 'plan_starter',
      planName: 'Starter Plan',
      description: 'Ideal for single turf owners getting started.',
      isPopular: false,
      monthlyPrice: 999.00,
      monthlyBranchLimit: 1,
      monthlySportsLimit: 2,
      monthlyBookingLimit: 200,
      monthlyActiveUsersLimit: 5,
      yearlyPrice: 9999.00,
      yearlyBranchLimit: 1,
      yearlySportsLimit: 2,
      yearlyBookingLimit: 2500,
      yearlyActiveUsersLimit: 5,
      features: ['Online Slot Booking', 'Basic Analytics', 'Email Notifications', 'Standard Support'],
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: 'plan_pro' },
    update: {},
    create: {
      id: 'plan_pro',
      planName: 'Professional Plan',
      description: 'Perfect for growing multi-turf sports complexes.',
      isPopular: true,
      monthlyPrice: 2499.00,
      monthlyBranchLimit: 5,
      monthlySportsLimit: 6,
      monthlyBookingLimit: 1000,
      monthlyActiveUsersLimit: 20,
      yearlyPrice: 24999.00,
      yearlyBranchLimit: 5,
      yearlySportsLimit: 6,
      yearlyBookingLimit: 15000,
      yearlyActiveUsersLimit: 20,
      features: ['All Starter Features', 'Multi-Branch Management', 'Advanced Analytics & Exports', 'POS Integration', 'Priority 24/7 Support'],
    },
  });

  // 2. Users
  console.log('  ➜ Seeding Mock Users...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {},
    create: {
      id: 'usr_superadmin_01',
      name: 'Super Administrator',
      email: 'superadmin@gmail.com',
      passwordHash: hash123456,
      role: 'SUPER_ADMIN',
      mobile: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@gmail.com' },
    update: {},
    create: {
      id: 'own_001_usr',
      name: 'Rajesh Sharma (Turf Owner)',
      email: 'owner@gmail.com',
      passwordHash: hash123456,
      role: 'OWNER',
      mobile: '+91 98765 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: {
      id: 'usr_customer_01',
      name: 'Rohan Verma',
      email: 'customer@gmail.com',
      passwordHash: hash123,
      role: 'CUSTOMER',
      mobile: '+91 98765 99999',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
    },
  });

  // 3. Owner Profile
  console.log('  ➜ Seeding Owner Profile...');
  const ownerProfile = await prisma.owner.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      id: 'own_001',
      userId: ownerUser.id,
      fullName: 'Rajesh Sharma',
      email: 'owner@gmail.com',
      mobile: '+91 98765 12345',
      businessName: 'Green Arena Sports Network',
      businessType: 'Sports & Recreation',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      activePlanId: 'plan_pro',
    },
  });

  // 4. Branches (Exactly 5 Clean Active Venues)
  console.log('  ➜ Seeding Exactly 5 Clean Turf Branches...');
  await prisma.booking.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.branch.deleteMany({});

  const initialBranches = [
    { id: 'br_001', name: 'Green Arena Football Turf', code: 'GA-MUM-01', city: 'Mumbai', address: 'Andheri West, Mumbai', email: 'andheri@greenarena.com' },
    { id: 'br_002', name: 'Champion Turf Ground', code: 'GA-IND-01', city: 'Indore', address: 'Vijay Nagar, Indore', email: 'indore@greenarena.com' },
    { id: 'br_003', name: 'Royal Cricket Ground', code: 'RC-IND-01', city: 'Indore', address: 'Palasia, Indore', email: 'royal@turfs.in' },
    { id: 'br_004', name: 'ProPlay Cricket Arena', code: 'PP-MUM-01', city: 'Mumbai', address: 'Vashi, Navi Mumbai', email: 'proplay@turfs.in' },
    { id: 'br_005', name: 'GameVault Cricket Center', code: 'GV-BLR-01', city: 'Bangalore', address: 'Koramangala, Bangalore', email: 'gamevault@turfs.in' },
  ];

  for (const b of initialBranches) {
    await prisma.branch.upsert({
      where: { id: b.id },
      update: {
        branchName: b.name,
        branchCode: b.code,
        city: b.city,
        fullAddress: b.address,
        email: b.email,
        ownerId: ownerProfile.id,
        ownerUserId: ownerUser.id,
      },
      create: {
        id: b.id,
        branchName: b.name,
        branchCode: b.code,
        description: 'FIFA certified multi-sport turf facility with floodlights and pro recovery amenities.',
        ownerId: ownerProfile.id,
        ownerUserId: ownerUser.id,
        subscriptionPlanId: 'plan_pro',
        city: b.city,
        fullAddress: b.address,
        email: b.email,
        mobile: '+91 98200 99999',
      },
    });
  }

  const branch1 = await prisma.branch.findUnique({ where: { id: 'br_001' } });
  const branch2 = await prisma.branch.findUnique({ where: { id: 'br_002' } });

  // 5. Sports
  console.log('  ➜ Seeding Sports...');
  const football = await prisma.sport.upsert({
    where: { name: 'Football' },
    update: {},
    create: {
      id: 'sp_master_01',
      name: 'Football',
      icon: '⚽',
      category: 'Team Sport',
      defaultSlotDuration: 60,
    },
  });

  const cricket = await prisma.sport.upsert({
    where: { name: 'Cricket' },
    update: {},
    create: {
      id: 'sp_master_02',
      name: 'Cricket',
      icon: '🏏',
      category: 'Team Sport',
      defaultSlotDuration: 60,
    },
  });

  // 6. Slots & Bookings
  console.log('  ➜ Seeding Slots & Bookings...');
  const today = new Date();
  
  const slot1 = await prisma.slot.upsert({
    where: { id: 'slot_demo_01' },
    update: {},
    create: {
      id: 'slot_demo_01',
      branchId: branch1.id,
      sportId: football.id,
      courtName: 'Turf A',
      slotDate: today,
      startTime: '10:00:00',
      endTime: '11:00:00',
      duration: 60,
      regularPrice: 1200.00,
      status: 'BOOKED',
    },
  });

  await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bookingCode: 'BK-1001-DEMO',
      slotId: slot1.id,
      userId: customerUser.id,
      customerName: 'Rahul K.',
      mobileNumber: '+91 98765 11111',
      amount: 1200.00,
      duration: 60,
      status: 'COMPLETED',
    },
  });

  // 7. Corporate Booking Proposals
  console.log('  ➜ Seeding Corporate Booking Proposals...');
  await prisma.corporateBooking.upsert({
    where: { id: 'CORP-17870-DEMO' },
    update: {},
    create: {
      id: 'CORP-17870-DEMO',
      companyName: 'TechCorp Solutions Pvt Ltd',
      contactPerson: 'Vikram Singh',
      phone: '+91 98765 88888',
      email: 'events@techcorp.com',
      eventType: 'Corporate Tournament',
      city: 'Indore',
      preferredTurfId: branch2.id,
      estimatedPlayers: '40-50 Players',
      budget: '₹60,000 - ₹1,20,000',
      eventDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      timeSlot: 'Full Day Arena Booking (08:00 AM - 08:00 PM)',
      paymentTerms: 'GST_INVOICE_30_DAY_NET',
      status: 'NEW',
      notes: 'Requires catering setup and trophy distribution stage.',
    },
  });

  console.log('✅ Prisma Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
