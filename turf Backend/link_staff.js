const prisma = require('./src/config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hash123456 = await bcrypt.hash('123456', salt);

  const ownerUser = await prisma.user.findUnique({ where: { email: 'owner@gmail.com' } });
  const branch = await prisma.branch.findFirst({ where: { ownerUserId: ownerUser ? ownerUser.id : 'own_001_usr' } }) || await prisma.branch.findFirst();

  if (!branch) {
    console.error('No branch found for owner');
    return;
  }

  console.log('seeding user');
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@gmail.com' },
    update: {
      passwordHash: hash123456,
      role: 'STAFF',
      name: 'Staff User'
    },
    create: {
      id: 'usr_staff_demo_01',
      name: 'Staff User',
      email: 'staff@gmail.com',
      passwordHash: hash123456,
      role: 'STAFF',
      mobile: '+91 98765 43210'
    }
  });

  console.log('seeding staff member');
  const staffMember = await prisma.staffMember.upsert({
    where: { email: 'staff@gmail.com' },
    update: {
      userId: staffUser.id,
      branchId: branch.id,
      fullName: 'Staff User',
      phone : '+91 98765 43210',
      role: 'BRANCH_MANAGER',
      shiftSlot: 'FULL_DAY_SHIFT',
      status: 'Active'
    },
    create: {
      id: 'stf_demo_01',
      userId: staffUser.id,
      branchId: branch.id,
      fullName: 'Staff User',
      email: 'staff@gmail.com',
      phone: '+91 98765 43210',
      role: 'BRANCH_MANAGER',
      shiftSlot: 'FULL_DAY_SHIFT',
      status: 'Active'
    }
  });

  console.log('SUCCESS: Linked staff@gmail.com (Password: 123456) to owner branch', branch.id, 'User ID:', status.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());