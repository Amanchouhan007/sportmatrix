const prisma = require('../src/config/prisma');

async function testGetBillHistoryFix() {
  try {
    const branchIds = null;
    const matchWhere = branchIds === null ? {} : { match: { branchId: { in: branchIds } } };
    const [payments, matchPayments] = await Promise.all([
      prisma.payment.findMany({ where: {}, include: { user: true, booking: { include: { slot: { include: { branch: true } } } } }, orderBy: { createdAt: 'desc' } }),
      prisma.matchPayment.findMany({ where: matchWhere, include: { user: true, match: { include: { branch: true } } }, orderBy: { createdAt: 'desc' } })
    ]);

    const matchSlotIds = matchPayments.map(mp => mp.match?.slotId).filter(Boolean);
    const linkedBookings = matchSlotIds.length > 0
      ? await prisma.booking.findMany({ where: { slotId: { in: matchSlotIds } } })
      : [];
    const bookingBySlot = Object.fromEntries(linkedBookings.map(b => [b.slotId, b]));

    const logs = payments.map(p => {
      const resolvedCustomer = p.customerName || p.booking?.customerName || p.user?.name || '';
      return { id: p.id, customer: resolvedCustomer, source: 'Payment' };
    });

    for (const mp of matchPayments) {
      const linkedBooking = mp.match?.slotId ? bookingBySlot[mp.match.slotId] : null;
      const resolvedCustomerName = linkedBooking?.customerName || (mp.playerName && mp.playerName !== 'Player' ? mp.playerName : mp.user?.name) || 'Player';

      logs.push({ id: mp.id, customer: resolvedCustomerName, source: 'MatchPayment' });
    }

    console.log('=== PRODUCED BILLING LOGS ===');
    console.log(logs);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testGetBillHistoryFix();
