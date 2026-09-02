const jwt = require('../turf Backend/node_modules/jsonwebtoken');
const prisma = require('../turf Backend/src/config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026';
const PORT = process.env.PORT || 5005;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function auditUmpireConnectivity() {
    console.log('=== AUDITING UMPIRE FRONTEND-BACKEND-DATABASE CONNECTIVITY ===\n');
    const auditResults = [];

    let umpireUser = null;
    let token = null;

    try {
        // 1. Check DB Connection & Find Umpire User
        console.log('Step 1: DB Connectivity & Umpire User Verification');
        umpireUser = await prisma.user.findFirst({
            where: { role: 'UMPIRE' },
            include: { umpireProfile: true }
        });

        if (!umpireUser) {
            // Find any active user or create test umpire user
            umpireUser = await prisma.user.findFirst({ where: { status: 'ACTIVE' } });
            if (umpireUser) {
                await prisma.user.update({
                    where: { id: umpireUser.id },
                    data: { role: 'UMPIRE' }
                });
                console.log(`Updated user ${umpireUser.email} to UMPIRE role`);
            }
        }

        if (!umpireUser) {
            auditResults.push({ step: 'Database User Check', status: 'FAIL', detail: 'No Umpire user found in DB' });
            console.log('❌ No Umpire user available');
            return;
        }

        console.log(`  ✓ Found Umpire User: ${umpireUser.name} (${umpireUser.email}, ID: ${umpireUser.id})`);
        auditResults.push({ step: 'DB User Check', status: 'PASS', detail: `User ID: ${umpireUser.id}, Role: ${umpireUser.role}` });

        token = jwt.sign(
            { id: umpireUser.id, email: umpireUser.email, role: umpireUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Test GET /umpire/profile
        console.log('\nStep 2: Testing GET /api/v1/umpire/profile');
        try {
            const res = await fetch(`${BASE_URL}/umpire/profile`, { headers: authHeaders });
            const data = await res.json();
            if (res.ok && data.success) {
                console.log('  ✓ GET /profile successful:', data.data);
                auditResults.push({ step: 'GET /api/v1/umpire/profile', status: 'PASS', detail: `Profile Name: ${data.data.full_name}, License: ${data.data.license_no}` });
            } else {
                console.log('  ❌ GET /profile failed:', res.status, data);
                auditResults.push({ step: 'GET /api/v1/umpire/profile', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
            }
        } catch (err) {
            console.log('  ❌ GET /profile error:', err.message);
            auditResults.push({ step: 'GET /api/v1/umpire/profile', status: 'FAIL', detail: err.message });
        }

        // 3. Test PUT /umpire/profile
        console.log('\nStep 3: Testing PUT /api/v1/umpire/profile');
        try {
            const res = await fetch(`${BASE_URL}/umpire/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({
                    full_name: umpireUser.name || 'Vikram Singh (Umpire)',
                    upi_id: 'rajesh.umpire@okhdfcbank',
                    on_duty_status: true
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                console.log('  ✓ PUT /profile successful:', data.data);
                auditResults.push({ step: 'PUT /api/v1/umpire/profile', status: 'PASS', detail: `Updated UPI: ${data.data.upi_id}` });
            } else {
                console.log('  ❌ PUT /profile failed:', res.status, data);
                auditResults.push({ step: 'PUT /api/v1/umpire/profile', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
            }
        } catch (err) {
            console.log('  ❌ PUT /profile error:', err.message);
            auditResults.push({ step: 'PUT /api/v1/umpire/profile', status: 'FAIL', detail: err.message });
        }

        // 4. Test GET /umpire/matches
        console.log('\nStep 4: Testing GET /api/v1/umpire/matches');
        try {
            const res = await fetch(`${BASE_URL}/umpire/matches`, { headers: authHeaders });
            const data = await res.json();
            if (res.ok && data.success) {
                console.log(`  ✓ GET /matches successful: ${data.data.length} matches found`);
                auditResults.push({ step: 'GET /api/v1/umpire/matches', status: 'PASS', detail: `Matches count: ${data.data.length}` });
            } else {
                console.log('  ❌ GET /matches failed:', res.status, data);
                auditResults.push({ step: 'GET /api/v1/umpire/matches', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
            }
        } catch (err) {
            console.log('  ❌ GET /matches error:', err.message);
            auditResults.push({ step: 'GET /api/v1/umpire/matches', status: 'FAIL', detail: err.message });
        }

        // 5. Test POST /umpire/register-ground-match
        console.log('\nStep 5: Testing POST /api/v1/umpire/register-ground-match');
        let createdMatchId = null;
        try {
            const res = await fetch(`${BASE_URL}/umpire/register-ground-match`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    isNew: true,
                    teamAName: 'portugal',
                    teamACaptain: 'cr7',
                    teamAPhone: '122345',
                    teamBName: 'argentina',
                    teamBCaptain: 'm10',
                    teamBPhone: '54321'
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                createdMatchId = data.data.matchId;
                console.log('  ✓ POST /register-ground-match successful, Match ID:', createdMatchId);
                auditResults.push({ step: 'POST /api/v1/umpire/register-ground-match', status: 'PASS', detail: `Match ID: ${createdMatchId}` });
            } else {
                console.log('  ❌ POST /register-ground-match failed:', res.status, data);
                auditResults.push({ step: 'POST /api/v1/umpire/register-ground-match', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
            }
        } catch (err) {
            console.log('  ❌ POST /register-ground-match error:', err.message);
            auditResults.push({ step: 'POST /api/v1/umpire/register-ground-match', status: 'FAIL', detail: err.message });
        }

        if (createdMatchId) {
            // 6. Test POST /umpire/toss
            console.log('\nStep 6: Testing POST /api/v1/umpire/toss');
            try {
                const res = await fetch(`${BASE_URL}/umpire/toss`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        matchId: createdMatchId,
                        tossWinner: 'portugal',
                        tossDecision: 'bat'
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    console.log('  ✓ POST /toss successful');
                    auditResults.push({ step: 'POST /api/v1/umpire/toss', status: 'PASS', detail: `Toss recorded for match ${createdMatchId}` });
                } else {
                    console.log('  ❌ POST /toss failed:', res.status, data);
                    auditResults.push({ step: 'POST /api/v1/umpire/toss', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
                }
            } catch (err) {
                console.log('  ❌ POST /toss error:', err.message);
                auditResults.push({ step: 'POST /api/v1/umpire/toss', status: 'FAIL', detail: err.message });
            }

            // 7. Test POST /umpire/score
            console.log('\nStep 7: Testing POST /api/v1/umpire/score');
            try {
                const res = await fetch(`${BASE_URL}/umpire/score`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        matchId: createdMatchId,
                        currentScoreSummary: 'portugal: 12/0 (1.0 ov)',
                        ballByBallFeed: JSON.stringify({ engine: { innings1: { runs: 12, wickets: 0, legalBalls: 6 } } }),
                        topBatsmanName: 'cr7',
                        topBatsmanRuns: 12,
                        topBowlerName: 'm10',
                        topBowlerWickets: 0
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    console.log('  ✓ POST /score successful');
                    auditResults.push({ step: 'POST /api/v1/umpire/score', status: 'PASS', detail: `Score updated for match ${createdMatchId}` });
                } else {
                    console.log('  ❌ POST /score failed:', res.status, data);
                    auditResults.push({ step: 'POST /api/v1/umpire/score', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
                }
            } catch (err) {
                console.log('  ❌ POST /score error:', err.message);
                auditResults.push({ step: 'POST /api/v1/umpire/score', status: 'FAIL', detail: err.message });
            }

            // 8. Test POST /umpire/payment-status
            console.log('\nStep 8: Testing POST /api/v1/umpire/payment-status');
            try {
                const res = await fetch(`${BASE_URL}/umpire/payment-status`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        matchId: createdMatchId,
                        paymentStatus: 'RECEIVED'
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    console.log('  ✓ POST /payment-status successful');
                    auditResults.push({ step: 'POST /api/v1/umpire/payment-status', status: 'PASS', detail: `Payment status marked RECEIVED` });
                } else {
                    console.log('  ❌ POST /payment-status failed:', res.status, data);
                    auditResults.push({ step: 'POST /api/v1/umpire/payment-status', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
                }
            } catch (err) {
                console.log('  ❌ POST /payment-status error:', err.message);
                auditResults.push({ step: 'POST /api/v1/umpire/payment-status', status: 'FAIL', detail: err.message });
            }

            // 9. Test POST /umpire/complete
            console.log('\nStep 9: Testing POST /api/v1/umpire/complete');
            try {
                const res = await fetch(`${BASE_URL}/umpire/complete`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({
                        matchId: createdMatchId,
                        winnerTeamSide: 'TEAM_A'
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    console.log('  ✓ POST /complete successful');
                    auditResults.push({ step: 'POST /api/v1/umpire/complete', status: 'PASS', detail: `Match certified & completed` });
                } else {
                    console.log('  ❌ POST /complete failed:', res.status, data);
                    auditResults.push({ step: 'POST /api/v1/umpire/complete', status: 'FAIL', detail: `Status ${res.status}: ${data.message}` });
                }
            } catch (err) {
                console.log('  ❌ POST /complete error:', err.message);
                auditResults.push({ step: 'POST /api/v1/umpire/complete', status: 'FAIL', detail: err.message });
            }

            // Cleanup test record
            try {
                const dutyAssignment = await prisma.umpireDutyAssignment.findFirst({ where: { matchId: createdMatchId } });
                if (dutyAssignment) {
                    await prisma.umpireDutyAssignment.delete({ where: { id: dutyAssignment.id } });
                }
                await prisma.matchTeam.deleteMany({ where: { matchId: createdMatchId } });
                await prisma.match.delete({ where: { id: createdMatchId } });
                console.log('✓ Test match cleaned up successfully');
            } catch (cleanupErr) {
                console.warn('Cleanup warning:', cleanupErr.message);
            }
        }

    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        await prisma.$disconnect();
        console.log('\n=== AUDIT SUMMARY RESULTS ===');
        console.table(auditResults);
    }
}

auditUmpireConnectivity();
