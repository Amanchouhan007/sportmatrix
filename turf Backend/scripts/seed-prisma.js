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

  // 8. Club Teams & Real Live DARE_TO_PLAY Matches
  console.log('  ➜ Seeding Club Teams & Live Dare Challenges into Database...');
  
  const team1 = await prisma.clubTeam.upsert({
    where: { id: 'team_ind_01' },
    update: {},
    create: {
      id: 'team_ind_01',
      branchId: 'br_002',
      teamName: 'Indore Strikers XI',
      sport: 'Cricket',
      rosterCount: 11,
      rank: '#1 Indore Hub',
      wins: 14,
      losses: 2,
    }
  });

  const team2 = await prisma.clubTeam.upsert({
    where: { id: 'team_ind_02' },
    update: {},
    create: {
      id: 'team_ind_02',
      branchId: 'br_003',
      teamName: 'Palasia Smashers',
      sport: 'Cricket',
      rosterCount: 11,
      rank: '#2 Indore Central',
      wins: 12,
      losses: 3,
    }
  });

  const team3 = await prisma.clubTeam.upsert({
    where: { id: 'team_ind_03' },
    update: {},
    create: {
      id: 'team_ind_03',
      branchId: 'br_002',
      teamName: 'Vijay Nagar Royals',
      sport: 'Cricket',
      rosterCount: 11,
      rank: '#1 Vijay Nagar',
      wins: 9,
      losses: 4,
    }
  });

  const team4 = await prisma.clubTeam.upsert({
    where: { id: 'team_ind_04' },
    update: {},
    create: {
      id: 'team_ind_04',
      branchId: 'br_003',
      teamName: 'Indore Super Kings',
      sport: 'Cricket',
      rosterCount: 11,
      rank: '#3 Indore Premier',
      wins: 11,
      losses: 5,
    }
  });

  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const dareSlot1 = await prisma.slot.upsert({
    where: { id: 'slot_dare_01' },
    update: {},
    create: {
      id: 'slot_dare_01',
      branchId: 'br_002',
      sportId: cricket.id,
      courtName: 'Cricket Pitch 1',
      slotDate: today,
      startTime: '20:30:00',
      endTime: '21:30:00',
      duration: 60,
      regularPrice: 900.00,
      peakPrice: 1200.00,
      status: 'BOOKED',
    }
  });

  const dareSlot2 = await prisma.slot.upsert({
    where: { id: 'slot_dare_02' },
    update: {},
    create: {
      id: 'slot_dare_02',
      branchId: 'br_003',
      sportId: cricket.id,
      courtName: 'Main Cricket Arena',
      slotDate: tomorrow,
      startTime: '07:00:00',
      endTime: '08:00:00',
      duration: 60,
      regularPrice: 1600.00,
      peakPrice: 1800.00,
      status: 'BOOKED',
    }
  });

  const dareSlot3 = await prisma.slot.upsert({
    where: { id: 'slot_dare_03' },
    update: {},
    create: {
      id: 'slot_dare_03',
      branchId: 'br_002',
      sportId: cricket.id,
      courtName: 'Box Court B',
      slotDate: tomorrow,
      startTime: '20:00:00',
      endTime: '21:00:00',
      duration: 60,
      regularPrice: 1200.00,
      peakPrice: 1400.00,
      status: 'BOOKED',
    }
  });

  const dareSlot4 = await prisma.slot.upsert({
    where: { id: 'slot_dare_04' },
    update: {},
    create: {
      id: 'slot_dare_04',
      branchId: 'br_003',
      sportId: cricket.id,
      courtName: 'Floodlit Arena',
      slotDate: tomorrow,
      startTime: '21:00:00',
      endTime: '22:00:00',
      duration: 60,
      regularPrice: 1000.00,
      peakPrice: 1200.00,
      status: 'BOOKED',
    }
  });

  // Seed DARE_TO_PLAY matches
  await prisma.match.upsert({
    where: { id: 'MATCH-DARE-001' },
    update: {},
    create: {
      id: 'MATCH-DARE-001',
      slotId: dareSlot1.id,
      branchId: 'br_002',
      sportId: cricket.id,
      captainAId: customerUser.id,
      teamAName: 'Indore Strikers XI',
      teamBName: 'Open Challenge',
      paymentMode: 'DARE_TO_PLAY',
      matchStatus: 'CONFIRMED',
      totalAmount: 1800.00,
      teamAShare: 540.00,
      teamBShare: 540.00,
      dareStrategy: 'SECURED_PREPAYMENT',
      teams: {
        create: [
          { teamSide: 'TEAM_A', teamName: 'Indore Strikers XI', captainUserId: customerUser.id, captainName: 'Rahul K.', captainPhone: '+91 98765 11111' },
          { teamSide: 'TEAM_B', teamName: 'Open Challenge', captainName: 'Waiting for Opponent', captainPhone: 'N/A' }
        ]
      }
    }
  });

  await prisma.match.upsert({
    where: { id: 'MATCH-DARE-002' },
    update: {},
    create: {
      id: 'MATCH-DARE-002',
      slotId: dareSlot2.id,
      branchId: 'br_003',
      sportId: cricket.id,
      captainAId: customerUser.id,
      teamAName: 'Palasia Smashers',
      teamBName: 'Open Challenge',
      paymentMode: 'DARE_TO_PLAY',
      matchStatus: 'CONFIRMED',
      totalAmount: 3200.00,
      teamAShare: 960.00,
      teamBShare: 960.00,
      dareStrategy: 'SECURED_PREPAYMENT',
      teams: {
        create: [
          { teamSide: 'TEAM_A', teamName: 'Palasia Smashers', captainUserId: customerUser.id, captainName: 'Sameer V.', captainPhone: '+91 98765 22222' },
          { teamSide: 'TEAM_B', teamName: 'Open Challenge', captainName: 'Waiting for Opponent', captainPhone: 'N/A' }
        ]
      }
    }
  });

  await prisma.match.upsert({
    where: { id: 'MATCH-DARE-003' },
    update: {},
    create: {
      id: 'MATCH-DARE-003',
      slotId: dareSlot3.id,
      branchId: 'br_002',
      sportId: cricket.id,
      captainAId: customerUser.id,
      teamAName: 'Vijay Nagar Royals',
      teamBName: 'Open Challenge',
      paymentMode: 'DARE_TO_PLAY',
      matchStatus: 'CONFIRMED',
      totalAmount: 2400.00,
      teamAShare: 720.00,
      teamBShare: 720.00,
      dareStrategy: 'SECURED_PREPAYMENT',
      teams: {
        create: [
          { teamSide: 'TEAM_A', teamName: 'Vijay Nagar Royals', captainUserId: customerUser.id, captainName: 'Karan J.', captainPhone: '+91 98765 33333' },
          { teamSide: 'TEAM_B', teamName: 'Open Challenge', captainName: 'Waiting for Opponent', captainPhone: 'N/A' }
        ]
      }
    }
  });

  await prisma.match.upsert({
    where: { id: 'MATCH-DARE-004' },
    update: {},
    create: {
      id: 'MATCH-DARE-004',
      slotId: dareSlot4.id,
      branchId: 'br_003',
      sportId: cricket.id,
      captainAId: customerUser.id,
      teamAName: 'Indore Super Kings',
      teamBName: 'Open Challenge',
      paymentMode: 'DARE_TO_PLAY',
      matchStatus: 'CONFIRMED',
      totalAmount: 2000.00,
      teamAShare: 600.00,
      teamBShare: 600.00,
      dareStrategy: 'SECURED_PREPAYMENT',
      teams: {
        create: [
          { teamSide: 'TEAM_A', teamName: 'Indore Super Kings', captainUserId: customerUser.id, captainName: 'Amit S.', captainPhone: '+91 98765 44444' },
          { teamSide: 'TEAM_B', teamName: 'Open Challenge', captainName: 'Waiting for Opponent', captainPhone: 'N/A' }
        ]
      }
    }
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
