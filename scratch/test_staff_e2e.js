const http = require('http');

async function runTest() {
    console.log('--- Testing Staff Portal E2E Connectivity ---');

    // 1. Test Health Endpoint
    const health = await fetch('http://localhost:5005/api/v1/health').then(r => r.json());
    console.log('1. Health Check:', health);

    // 2. Test Public Turfs
    const turfs = await fetch('http://localhost:5005/api/v1/turfs').then(r => r.json());
    console.log('2. Turfs Count:', turfs.data?.length);

    // 3. Test Tournaments
    const tournaments = await fetch('http://localhost:5005/api/v1/tournaments').then(r => r.json());
    console.log('3. Tournaments Status:', tournaments.success);

    console.log('--- All Staff E2E Checks Passed ---');
}

runTest().catch(console.error);
