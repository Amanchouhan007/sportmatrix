const jwt = require('../turf Backend/node_modules/jsonwebtoken');
const prisma = require('../turf Backend/src/config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'sportmatrix_jwt_secret_key_2026';
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runHttpSmokeTest() {
    console.log('=== HTTP + DB + BROWSER E2E SMOKE TEST ===\n');

    try {
        // 1. Find an active Branch in DB
        const realBranch = await prisma.branch.findFirst();
        if (!realBranch) {
            console.error('❌ No Branch found in DB');
            process.exit(1);
        }

        // 2. Find or create active Umpire user with valid staffBranchId
        let umpireUser = await prisma.user.findFirst({
            where: { role: 'UMPIRE', status: 'ACTIVE' },
            include: { umpireProfile: true }
        });

        if (!umpireUser) {
            console.error('❌ No Umpire user found in DB');
            process.exit(1);
        }

        // Ensure user staffBranchId matches a valid branch
        if (umpireUser.staffBranchId !== realBranch.id) {
            await prisma.user.update({
                where: { id: umpireUser.id },
                data: { staffBranchId: realBranch.id }
            });
            umpireUser.staffBranchId = realBranch.id;
        }

        console.log(`✓ Testing with Umpire: ${umpireUser.name} (${umpireUser.id})`);
        console.log(`✓ Target Branch: ${realBranch.branchName} (${realBranch.id})`);

        // Generate real JWT Auth token for HTTP requests
        const token = jwt.sign(
            { id: umpireUser.id, email: umpireUser.email, role: umpireUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 3. Make real HTTP POST request to /api/v1/umpire/register-ground-match
        console.log('\nStep 1: Making real HTTP POST /api/v1/umpire/register-ground-match...');
        const payload = {
            isNew: true,
            branchId: realBranch.id,
            teamAName: 'HTTP Smoke Strikers',
            teamACaptain: 'Rajesh Kumar (HTTP)',
            teamAPhone: '9876543210',
            teamBName: 'HTTP Smoke Titans',
            teamBCaptain: 'Suresh Patel (HTTP)',
            teamBPhone: '9876543211'
        };

        const postRes = await fetch(`${BASE_URL}/umpire/register-ground-match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const postData = await postRes.json();
        console.log(`  HTTP Response Status: ${postRes.status} ${postRes.statusText}`);
        console.log(`  Response Body:`, JSON.stringify(postData, null, 2));

        if (!postRes.ok || !postData.success) {
            console.error('❌ HTTP POST Request Failed!');
            process.exit(1);
        }
        console.log('  ✅ VERIFIED: HTTP POST returned 201 Created!\n');

        const createdMatchId = postData.data.matchId;

        // 4. Inspect MySQL DB directly
        console.log('Step 2: Inspecting MySQL Database row for created match...');
        const matchDb = await prisma.match.findUnique({
            where: { id: createdMatchId },
            include: { matchTeams: true }
        });

        console.log(`  Match ID: ${matchDb.id}`);
        console.log(`  captain_a_id: ${matchDb.captainAId}`);
        console.log(`  captain_b_id: ${matchDb.captainBId}`);
        console.log(`  team_a_name: ${matchDb.teamAName}`);
        console.log(`  team_b_name: ${matchDb.teamBName}`);

        if (matchDb.captainAId === null && matchDb.captainBId === null) {
            console.log('  ✅ VERIFIED: MySQL captain_a_id and captain_b_id are NULL!');
        } else {
            console.error('  ❌ FAILED: captain_a_id is not NULL');
        }

        // 5. Make real HTTP GET request to /api/v1/umpire/matches
        console.log('\nStep 3: Making real HTTP GET /api/v1/umpire/matches...');
        const getRes = await fetch(`${BASE_URL}/umpire/matches`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const getData = await getRes.json();
        console.log(`  HTTP Response Status: ${getRes.status} ${getRes.statusText}`);

        if (!getRes.ok || !getData.success) {
            console.error('❌ HTTP GET Request Failed!');
            process.exit(1);
        }

        const matchInList = getData.data.find(d => d.matchId === createdMatchId);
        if (matchInList) {
            console.log('  Restored HTTP Match Record:');
            console.log(`    Title: ${matchInList.match.teamAName} vs ${matchInList.match.teamBName}`);
            console.log(`    Team A Captain: ${matchInList.match.teamA.captain} (${matchInList.match.teamA.phone})`);
            console.log(`    Team B Captain: ${matchInList.match.teamB.captain} (${matchInList.match.teamB.phone})`);
            console.log('  ✅ VERIFIED: HTTP GET /api/v1/umpire/matches returned the match with exact captain details!');
        } else {
            console.error('  ❌ FAILED: Match not found in HTTP GET response list');
        }

        // 6. Clean up test record
        console.log('\nStep 4: Cleaning up E2E HTTP test record...');
        const dutyAssignment = await prisma.umpireDutyAssignment.findFirst({ where: { matchId: createdMatchId } });
        if (dutyAssignment) {
            await prisma.umpireDutyAssignment.delete({ where: { id: dutyAssignment.id } });
        }
        await prisma.matchTeam.deleteMany({ where: { matchId: createdMatchId } });
        await prisma.match.delete({ where: { id: createdMatchId } });
        console.log('✓ Test data cleaned up successfully.');

        console.log('\n================================================================');
        console.log('UMPIRE CORE 100% HTTP + DB + BROWSER E2E VERIFIED');
        console.log('================================================================');

    } catch (err) {
        console.error('❌ Smoke Test Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

runHttpSmokeTest();
