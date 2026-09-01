const jwt = require('c:/Users/91969/OneDrive/Desktop/yashturf/sport-turfs/turf Backend/node_modules/jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'sportmatrix_jwt_secret_key_2026';
const token = jwt.sign(
    { id: 'own_001_usr', email: 'owner@kiaanturf.com', role: 'OWNER' },
    JWT_SECRET,
    { expiresIn: '24h' }
);

console.log('--------------------------------------------------------------------------------');
console.log('🔑 GENERATED VALID OWNER JWT TOKEN FOR DIAGNOSTICS');
console.log('--------------------------------------------------------------------------------\n');

const endpoints = [
    { name: '1. Dashboard Summary', path: '/api/v1/dashboard/summary' },
    { name: '2. Dashboard History Log', path: '/api/v1/dashboard/history' },
    { name: '3. Branches List', path: '/api/v1/branches' },
    { name: '4. Bookings History', path: '/api/v1/bookings/history' },
    { name: '5. Bookings Summary', path: '/api/v1/bookings/summary' },
    { name: '6. Billing Ledger', path: '/api/v1/billing/history' },
    { name: '7. Master Sports Catalog', path: '/api/v1/sports/master' },
    { name: '8. Branch Sports Config', path: '/api/v1/sports/branch/br_1787308241625' },
    { name: '9. Tournaments List', path: '/api/v1/tournaments' },
    { name: '10. Teams & Roster', path: '/api/v1/teams' },
    { name: '11. Inventory Items', path: '/api/v1/inventory' },
    { name: '12. Maintenance Tasks', path: '/api/v1/maintenance' },
    { name: '13. Staff Users', path: '/api/v1/staff' },
    { name: '14. Advertising Ads', path: '/api/v1/ads' },
    { name: '15. CRM Leads', path: '/api/v1/crm/leads' }
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5005,
            path: endpoint.path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(body); } catch(e) {}
                const isSuccess = res.statusCode >= 200 && res.statusCode < 300 && (parsed?.success !== false);
                resolve({
                    name: endpoint.name,
                    path: endpoint.path,
                    statusCode: res.statusCode,
                    isSuccess,
                    dataSummary: parsed?.data ? (Array.isArray(parsed.data) ? `${parsed.data.length} item(s)` : 'Object returned') : (parsed?.message || body.substring(0, 60))
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                name: endpoint.name,
                path: endpoint.path,
                statusCode: 0,
                isSuccess: false,
                dataSummary: `Connection Error: ${err.message}`
            });
        });

        req.end();
    });
}

async function runAllHttpTests() {
    console.log('🚀 TESTING ALL 15 ADMIN BACKEND HTTP ENDPOINTS ON PORT 5005...\n');
    const results = [];

    for (const ep of endpoints) {
        const res = await testEndpoint(ep);
        results.push(res);
        const icon = res.isSuccess ? '✅ [PASS]' : '❌ [FAIL]';
        console.log(`${icon} ${res.name} (${res.path}) -> HTTP ${res.statusCode} | Result: ${res.dataSummary}`);
    }

    console.log('\n================================================================================');
    console.log('📊 AUDIT SUMMARY REPORT');
    const passed = results.filter(r => r.isSuccess).length;
    const failed = results.filter(r => !r.isSuccess).length;
    console.log(`TOTAL ADMIN API ENDPOINTS TESTED: ${results.length}`);
    console.log(`PASSED (HTTP 200 OK): ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('================================================================================');
}

runAllHttpTests();
