const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'turf_db'
};

async function seedMasterData() {
    let connection;
    try {
        console.log('Connecting to MySQL Database for Master Seeding...');
        connection = await mysql.createConnection(dbConfig);

        // 1. Seed Branches if missing
        console.log('Verifying Branches...');
        const branches = [
            ['br_101', 'Spike Cricket Turf', 'ST-IND-01', 'Bhawarkua, Indore', 'Indore', 'ACTIVE'],
            ['br_102', 'Royal Cricket Ground', 'RC-IND-02', 'Vijay Nagar, Indore', 'Indore', 'ACTIVE'],
            ['br_103', 'Indore Sports Complex', 'ISC-IND-03', 'LIG Colony, Indore', 'Indore', 'ACTIVE']
        ];
        for (const b of branches) {
            await connection.query(`
                INSERT INTO branches (id, branch_name, branch_code, full_address, city, status)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE branch_name=VALUES(branch_name)
            `, b);
        }

        // 2. Seed Sports if missing
        console.log('Verifying Sports...');
        await connection.query(`
            INSERT INTO sports (id, name, icon, category)
            VALUES ('sp_cricket', 'Cricket', '🏏', 'Team Sport'), ('sp_football', 'Football', '⚽', 'Team Sport')
            ON DUPLICATE KEY UPDATE name=VALUES(name)
        `);

        // 3. Seed Tournaments
        console.log('Seeding Tournaments...');
        const tournaments = [];

        for (const t of tournaments) {
            await connection.query(`
                INSERT INTO tournaments (id, branch_id, sport_id, title, description, start_date, end_date, entry_fee_per_team, maximum_teams, prize_pool_total, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status), prize_pool_total=VALUES(prize_pool_total)
            `, t);
        }

        // 4. Seed Teams
        console.log('Seeding Teams...');
        const teams = [];

        for (const tm of teams) {
            await connection.query(`
                INSERT INTO teams (id, tournament_id, team_name, captain_name, captain_email, captain_mobile, payment_status, payment_method, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE team_name=VALUES(team_name), captain_name=VALUES(captain_name)
            `, tm);
        }

        // 5. Seed Umpire Profile & Matches
        console.log('Seeding Umpire Data...');
        const umpireMatches = [];

        for (const um of umpireMatches) {
            await connection.query(`
                INSERT INTO umpire_matches (
                    id, match_code, umpire_id, tournament_id, match_title, match_type, venue, scheduled_time, duty_fee,
                    payment_status, payment_mode, receipt_no, team1_name, team1_captain, team1_phone, team1_score, team1_wickets, team1_overs,
                    team2_name, team2_captain, team2_phone, team2_score, team2_wickets, team2_overs, target, winner_name, toss_winner, toss_decision, match_status, current_innings, leaderboard_multiplier
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE match_title=VALUES(match_title), team1_score=VALUES(team1_score), match_status=VALUES(match_status)
            `, um);
        }

        // 6. Seed Player Leaderboard
        console.log('Seeding Player Leaderboard...');
        const players = [];

        for (const p of players) {
            await connection.query(`
                INSERT INTO player_leaderboard (id, name, avatar, team, city, sport, role, matches, runs, batting_avg, strike_rate, wickets, economy, win_rate, mvps, highest_score, best_bowling, verification_tier, tier_multiplier, trust_score, badges)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name=VALUES(name), runs=VALUES(runs), matches=VALUES(matches)
            `, p);
        }

        // 7. Seed Advertisements
        console.log('Seeding Advertisements...');
        const ads = [];
        for (const ad of ads) {
            await connection.query(`
                INSERT INTO advertisements (id, branch_id, owner_id, name, type, status, icon, duration_months, budget_total, daily_budget, budget_spent, commission_rate, commission_paid, booking_goal, avg_slot_price, target_radius_km, estimated_reach, revenue, views, clicks, bookings, ctr, roi, cpa, start_date, end_date, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status)
            `, ad);
        }

        // 8. Seed CRM Leads
        console.log('Seeding CRM Leads...');
        const crmLeads = [];
        for (const lead of crmLeads) {
            await connection.query(`
                INSERT INTO crm_leads (id, branch_id, contact_name, phone, email, category, team_name, slot_preference, preferred_sport, status, notes, broadcast_count, last_broadcast_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE contact_name=VALUES(contact_name), status=VALUES(status)
            `, lead);
        }

        // 9. Seed Inventory
        console.log('Seeding Inventory...');
        const inventoryItems = [];
        for (const item of inventoryItems) {
            await connection.query(`
                INSERT INTO inventory (id, branch_id, item_name, category_class, category, stock_quantity, min_threshold, unit_price, asset_value, \`condition\`, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE item_name=VALUES(item_name), stock_quantity=VALUES(stock_quantity)
            `, item);
        }

        // 10. Seed Maintenance Tickets
        console.log('Seeding Maintenance Tickets...');
        const maintenanceTickets = [];
        for (const ticket of maintenanceTickets) {
            await connection.query(`
                INSERT INTO maintenance_tickets (id, asset_name, category, issue_description, priority, cost, status, assigned_to)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE asset_name=VALUES(asset_name), status=VALUES(status)
            `, ticket);
        }

        console.log('Master Seeding Completed Successfully across all 12 Core Tables!');
    } catch (e) {
        console.error('Error seeding master data:', e);
    } finally {
        if (connection) await connection.end();
    }
}

seedMasterData();
