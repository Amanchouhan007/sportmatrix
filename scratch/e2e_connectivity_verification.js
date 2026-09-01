const prisma = require('../turf Backend/src/config/prisma');
const { posCheckout, getBillHistory } = require('../turf Backend/src/modules/billing/billing.controller');
const { getDashboardSummary } = require('../turf Backend/src/modules/dashboard/dashboard.controller');

async function runE2EConnectivityTest() {
    console.log('--------------------------------------------------');
    console.log('🚀 STARTING E2E CONNECTIVITY & DB-TO-UI AUDIT TEST');
    console.log('--------------------------------------------------');

    const testCustomerName = `E2E_Customer_${Math.floor(100 + Math.random() * 900)}`;
    const testAmount = 1800;
    const testPhone = '9988776655';
    const testDate = new Date().toISOString().split('T')[0];

    console.log(`\n1. [FEED TEST] Submitting POS Sale for customer: "${testCustomerName}" (₹${testAmount})...`);

    const reqMock = {
        body: {
            slotDate: testDate,
            slotTime: '08:00 PM',
            duration: 60,
            customerName: testCustomerName,
            customerPhone: testPhone,
            paymentMethod: 'UPI',
            paymentStatus: 'Paid',
            totalAmount: testAmount,
            courtName: 'Box Cricket Pitch 1'
        }
    };

    let posResult = null;
    const resMock = {
        status: (code) => ({
            json: (payload) => {
                posResult = { code, payload };
            }
        })
    };

    await posCheckout(reqMock, resMock);

    if (!posResult || posResult.code !== 201) {
        console.error('❌ POS FEED FAILED:', posResult);
        process.exit(1);
    }
    console.log('✅ POS FEED SUCCESS! Invoice generated:', posResult.payload.data.invoiceNumber);

    console.log('\n2. [MYSQL AUDIT] Verifying records in MySQL database...');
    const insertedBooking = await prisma.booking.findFirst({
        where: { customerName: testCustomerName },
        orderBy: { id: 'desc' }
    });

    const insertedPayment = await prisma.payment.findFirst({
        where: { customerName: testCustomerName },
        orderBy: { id: 'desc' }
    });

    if (!insertedBooking) {
        console.error('❌ BOOKING NOT FOUND IN MYSQL!');
        process.exit(1);
    }
    console.log(`✅ MYSQL BOOKING VERIFIED! ID: ${insertedBooking.id}, Customer: "${insertedBooking.customerName}", Amount: ₹${insertedBooking.amount}`);

    if (!insertedPayment) {
        console.error('❌ PAYMENT NOT FOUND IN MYSQL!');
        process.exit(1);
    }
    console.log(`✅ MYSQL PAYMENT VERIFIED! Invoice: ${insertedPayment.invoiceNumber}, Customer: "${insertedPayment.customerName}", Amount: ₹${insertedPayment.amount}`);

    console.log('\n3. [DASHBOARD SUMMARY AUDIT] Verifying Admin Dashboard output...');
    let dashData = null;
    const dashReq = { user: { id: 'usr_admin_1', role: 'SUPER_ADMIN' } };
    const dashRes = {
        status: (code) => ({
            json: (payload) => {
                dashData = payload;
            }
        })
    };

    await getDashboardSummary(dashReq, dashRes);

    if (!dashData || !dashData.success || !dashData.data) {
        console.error('❌ DASHBOARD SUMMARY API FAILED:', dashData);
        process.exit(1);
    }

    const summary = dashData.data;
    console.log(`   - Today's Revenue: ₹${summary.todaysRevenue}`);
    console.log(`   - Today's Bookings Count: ${summary.todaysBookings}`);

    const foundInRecent = summary.recentBookings.find(b => b.customer === testCustomerName);
    if (!foundInRecent) {
        console.error('❌ NEW CUSTOMER NOT FOUND IN DASHBOARD RECENT BOOKINGS!');
        process.exit(1);
    }
    console.log(`✅ DASHBOARD VERIFIED! Customer "${foundInRecent.customer}" displayed with amount ${foundInRecent.amount}`);

    console.log('\n--------------------------------------------------');
    console.log('🎉 ALL E2E CONNECTIVITY & DB-TO-UI TESTS PASSED!');
    console.log('--------------------------------------------------');

    await prisma.$disconnect();
    process.exit(0);
}

runE2EConnectivityTest().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
