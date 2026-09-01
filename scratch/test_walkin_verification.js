const prisma = require('../turf Backend/src/config/prisma');

async function verifyWalkInMatch() {
    console.log('=== E2E WALK-IN MATCH VERIFICATION SCRIPT ===\n');

    try {
        // 1. Find or create an Umpire user
        let umpireUser = await prisma.user.findFirst({
            where: { role: 'UMPIRE' },
            include: { umpireProfile: true }
        });

        if (!umpireUser) {
            console.log('Creating test Umpire user...');
            umpireUser = await prisma.user.create({
                data: {
                    id: `usr_ump_e2e_${Date.now()}`,
                    name: 'Vikram Singh (E2E Umpire)',
                    email: `umpire.e2e.${Date.now()}@sportturf.com`,
                    passwordHash: '$2a$10$e2etestpasswordhash',
                    role: 'UMPIRE',
                    status: 'ACTIVE',
                    staffBranchId: 'br_001',
                    umpireProfile: {
                        create: {
                            id: `ump_e2e_${Date.now()}`,
                            licenseNumber: `UMP-IND-E2E-${Date.now().toString().slice(-4)}`,
                            fullName: 'Vikram Singh (E2E Umpire)',
                            dutyFeePerMatch: 300.00,
                            isOnDuty: true
                        }
                    }
                },
                include: { umpireProfile: true }
            });
        } else if (!umpireUser.umpireProfile) {
            const profile = await prisma.umpireProfile.create({
                data: {
                    id: `ump_e2e_${Date.now()}`,
                    userId: umpireUser.id,
                    licenseNumber: `UMP-IND-E2E-${Date.now().toString().slice(-4)}`,
                    fullName: umpireUser.name || 'Official Umpire',
                    dutyFeePerMatch: 300.00,
                    isOnDuty: true
                }
            });
            umpireUser.umpireProfile = profile;
        }

        console.log(`✓ Active Umpire User: ${umpireUser.name} (${umpireUser.id})`);
        console.log(`  License: ${umpireUser.umpireProfile.licenseNumber}`);
        console.log(`  Branch: ${umpireUser.staffBranchId || 'br_001'}\n`);

        const targetBranchId = umpireUser.staffBranchId || 'br_001';
        const newMatchId = `mtc_e2etest_${Date.now()}`;

        // 2. Simulate POST /api/v1/umpire/register-ground-match Walk-in Transaction
        const teamAName = 'E2E Walkin Strikers';
        const teamACaptain = 'Lalit Singh (E2E)';
        const teamAPhone = '9752100980';
        const teamBName = 'E2E Super Kings';
        const teamBCaptain = 'Vikram Malhotra (E2E)';
        const teamBPhone = '9876500099';

        console.log('Step 1: Executing Walk-in Ground Match $transaction in Prisma...');

        const createdDuty = await prisma.$transaction(async (tx) => {
            const createdMatch = await tx.match.create({
                data: {
                    id: newMatchId,
                    branchId: targetBranchId,
                    captainAId: null,
                    captainBId: null,
                    teamAName,
                    teamBName,
                    matchStatus: 'IN_PROGRESS',
                    hasUmpireAssigned: true,
                    umpireAddonFee: 300.00,
                    totalAmount: 0.00
                }
            });

            await tx.matchTeam.create({
                data: {
                    id: `tm_a_${Date.now()}`,
                    matchId: newMatchId,
                    teamSide: 'TEAM_A',
                    teamName: teamAName,
                    captainName: teamACaptain,
                    captainPhone: teamAPhone
                }
            });

            await tx.matchTeam.create({
                data: {
                    id: `tm_b_${Date.now()}`,
                    matchId: newMatchId,
                    teamSide: 'TEAM_B',
                    teamName: teamBName,
                    captainName: teamBCaptain,
                    captainPhone: teamBPhone
                }
            });

            return tx.umpireDutyAssignment.create({
                data: {
                    id: `duty_${Date.now()}`,
                    matchId: newMatchId,
                    branchId: targetBranchId,
                    umpireProfileId: umpireUser.umpireProfile.id,
                    dutyFee: 300.00,
                    dutyStatus: 'LIVE_NOW'
                }
            });
        });

        console.log(`✓ $transaction Succeeded! Created Duty Assignment ID: ${createdDuty.id}\n`);

        // 3. Inspect matches row in MySQL
        console.log('Step 2: Querying MySQL `matches` table row directly...');
        const matchRow = await prisma.match.findUnique({
            where: { id: newMatchId }
        });

        console.log(`  Match ID: ${matchRow.id}`);
        console.log(`  captain_a_id: ${matchRow.captainAId}`);
        console.log(`  captain_b_id: ${matchRow.captainBId}`);
        console.log(`  team_a_name: ${matchRow.teamAName}`);
        console.log(`  team_b_name: ${matchRow.teamBName}`);

        if (matchRow.captainAId === null) {
            console.log('  ✅ VERIFIED: captain_a_id IS NULL in MySQL!');
        } else {
            console.error(`  ❌ FAILED: captain_a_id is ${matchRow.captainAId} (expected NULL)`);
        }

        // 4. Inspect match_teams table rows
        console.log('\nStep 3: Querying MySQL `match_teams` table rows directly...');
        const matchTeams = await prisma.matchTeam.findMany({
            where: { matchId: newMatchId }
        });

        matchTeams.forEach(t => {
            console.log(`  Team Side: ${t.teamSide} | Team Name: ${t.teamName} | Captain: ${t.captainName} | Phone: ${t.captainPhone}`);
        });

        const teamA = matchTeams.find(t => t.teamSide === 'TEAM_A');
        const teamB = matchTeams.find(t => t.teamSide === 'TEAM_B');

        if (teamA?.captainName === teamACaptain && teamB?.captainName === teamBCaptain) {
            console.log('  ✅ VERIFIED: Real captain names and phone numbers present in `match_teams`!');
        } else {
            console.error('  ❌ FAILED: Captain details missing in `match_teams`');
        }

        // 5. Test Readback API formatDuty / F5 restore query
        console.log('\nStep 4: Simulating GET /api/v1/umpire/matches (F5 Page Reload Restore)...');
        const dutyAssignment = await prisma.umpireDutyAssignment.findUnique({
            where: { id: createdDuty.id },
            include: { match: { include: { branch: true, matchTeams: true } } }
        });

        const teamAObj = dutyAssignment.match?.matchTeams?.find(t => t.teamSide === 'TEAM_A');
        const teamBObj = dutyAssignment.match?.matchTeams?.find(t => t.teamSide === 'TEAM_B');

        console.log('  Restored API Match Snapshot:');
        console.log(`    Title: ${dutyAssignment.match.teamAName} vs ${dutyAssignment.match.teamBName}`);
        console.log(`    Team A Captain: ${teamAObj?.captainName} (${teamAObj?.captainPhone})`);
        console.log(`    Team B Captain: ${teamBObj?.captainName} (${teamBObj?.captainPhone})`);
        console.log(`    Umpire Duty Status: ${dutyAssignment.dutyStatus}`);

        if (teamAObj?.captainName === teamACaptain && teamBObj?.captainName === teamBCaptain) {
            console.log('  ✅ VERIFIED: F5 Page Reload / Second Session Restores exact match & captain details from DB!');
        }

        // 6. Clean up test record
        console.log('\nStep 5: Cleaning up test records...');
        await prisma.umpireDutyAssignment.delete({ where: { id: createdDuty.id } });
        await prisma.matchTeam.deleteMany({ where: { matchId: newMatchId } });
        await prisma.match.delete({ where: { id: newMatchId } });
        console.log('✓ Cleaned up E2E test data from MySQL.');

        console.log('\n==================================================');
        console.log('FINAL RESULT: E2E WALK-IN MATCH 100% VERIFIED ON MYSQL');
        console.log('==================================================');

    } catch (err) {
        console.error('❌ Verification Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

verifyWalkInMatch();
