const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
};

async function initializeDatabase() {
    let connection;
    try {
        console.log('Connecting to MySQL Server...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server successfully.');

        // 1. Create Database if not exists
        const dbName = process.env.DB_NAME || 'turf_db';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database "${dbName}" verified/created successfully.`);

        // 2. Select Database
        await connection.query(`USE \`${dbName}\`;`);
        await connection.query(`SET FOREIGN_KEY_CHECKS = 0;`);

        // 3. Create Tables
        console.log('Creating tables...');

        // Users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('SUPER_ADMIN', 'OWNER', 'STAFF', 'CUSTOMER') DEFAULT 'CUSTOMER',
                mobile VARCHAR(20),
                alternate_mobile VARCHAR(20),
                avatar LONGTEXT,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        // Owners
        await connection.query(`
            CREATE TABLE IF NOT EXISTS owners (
                id VARCHAR(50) PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                mobile VARCHAR(20) UNIQUE NOT NULL,
                alternate_mobile VARCHAR(20),
                password_hash VARCHAR(255) NOT NULL,
                status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
                business_name VARCHAR(150),
                business_type VARCHAR(100),
                gst_number VARCHAR(50),
                pan_number VARCHAR(50),
                country VARCHAR(100) DEFAULT 'India',
                state VARCHAR(100),
                city VARCHAR(100),
                zip_code VARCHAR(20),
                full_address TEXT,
                profile_image LONGTEXT,
                created_by VARCHAR(50),
                updated_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        // Branches
        await connection.query(`
            CREATE TABLE IF NOT EXISTS branches (
                id VARCHAR(50) PRIMARY KEY,
                branch_name VARCHAR(150) NOT NULL,
                branch_code VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                owner_id VARCHAR(50),
                subscription_plan_id VARCHAR(50) DEFAULT 'plan_starter',
                country VARCHAR(100) DEFAULT 'India',
                state VARCHAR(100),
                city VARCHAR(100),
                zip_code VARCHAR(20),
                full_address TEXT,
                email VARCHAR(100),
                mobile VARCHAR(20),
                alternate_mobile VARCHAR(20),
                gst_number VARCHAR(50),
                timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
                currency VARCHAR(10) DEFAULT 'INR',
                logo VARCHAR(255),
                status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        // Sports (Master Table)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sports (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                icon VARCHAR(10) DEFAULT '⚽',
                category VARCHAR(50) DEFAULT 'Team Sport',
                default_slot_duration INT DEFAULT 60
            );
        `);

        // Branch Sports mapping
        await connection.query(`
            CREATE TABLE IF NOT EXISTS branch_sports (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50),
                sport_id VARCHAR(50),
                regular_price INT DEFAULT 0,
                peak_price INT DEFAULT 0,
                total_courts INT DEFAULT 1,
                opening_time TIME DEFAULT '06:00',
                closing_time TIME DEFAULT '22:00',
                slot_duration INT DEFAULT 60,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
                FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
            );
        `);

        // Slots
        await connection.query(`
            CREATE TABLE IF NOT EXISTS slots (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50),
                sport_id VARCHAR(50),
                court_name VARCHAR(100) NOT NULL,
                slot_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                duration INT NOT NULL,
                regular_price INT DEFAULT 0,
                peak_price INT DEFAULT 0,
                is_peak_hour BOOLEAN DEFAULT FALSE,
                status ENUM('AVAILABLE', 'BOOKED', 'BLOCKED', 'COMPLETED') DEFAULT 'AVAILABLE',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
                FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
            );
        `);

        // Bookings
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slot_id VARCHAR(50),
                user_id VARCHAR(50),
                customer_name VARCHAR(100) NOT NULL,
                mobile_number VARCHAR(20) NOT NULL,
                amount INT NOT NULL,
                duration INT NOT NULL,
                notes TEXT,
                status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        // Holidays
        await connection.query(`
            CREATE TABLE IF NOT EXISTS holidays (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50),
                title VARCHAR(150),
                holiday_date DATE NOT NULL,
                reason VARCHAR(255),
                is_full_day BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
            );
        `);

        // Wallets
        await connection.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) UNIQUE,
                balance INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Payments (Billing & Invoices)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NULL,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(100) NOT NULL,
                amount INT NOT NULL,
                payment_method ENUM('UPI', 'CASH', 'CARD', 'WALLET') DEFAULT 'UPI',
                status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'COMPLETED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
            );
        `);

        // Tournament Categories
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_categories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournaments
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournaments (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50) NOT NULL,
                title VARCHAR(150) NOT NULL,
                banner VARCHAR(255),
                sport_id VARCHAR(50) NOT NULL,
                category_id VARCHAR(50),
                description TEXT,
                rules TEXT,
                court_name VARCHAR(100) DEFAULT 'Court A',
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                registration_last_date DATE,
                max_teams INT DEFAULT 16,
                min_teams INT DEFAULT 4,
                entry_fee INT DEFAULT 0,
                winner_prize INT DEFAULT 0,
                runner_prize INT DEFAULT 0,
                third_prize INT DEFAULT 0,
                prize_pool VARCHAR(150),
                format ENUM('Knockout', 'League', 'League + Knockout') DEFAULT 'Knockout',
                match_duration INT DEFAULT 60,
                skill_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Open') DEFAULT 'Open',
                age_limit VARCHAR(50) DEFAULT 'Open',
                gender ENUM('Men', 'Women', 'Mixed', 'All') DEFAULT 'All',
                status ENUM('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled', 'Suspended') DEFAULT 'Draft',
                owner_remarks TEXT,
                created_by VARCHAR(50),
                approved_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
                FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Migration checks for tournaments table columns
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN category_id VARCHAR(50);`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN banner VARCHAR(255);`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN court_name VARCHAR(100) DEFAULT 'Court A';`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN rules TEXT;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN registration_last_date DATE;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN max_teams INT DEFAULT 16;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN min_teams INT DEFAULT 4;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN entry_fee INT DEFAULT 0;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN winner_prize INT DEFAULT 0;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN runner_prize INT DEFAULT 0;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN third_prize INT DEFAULT 0;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN prize_pool VARCHAR(150);`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN format ENUM('Knockout', 'League', 'League + Knockout') DEFAULT 'Knockout';`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN match_duration INT DEFAULT 60;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN skill_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Open') DEFAULT 'Open';`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN age_limit VARCHAR(50) DEFAULT 'Open';`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN gender ENUM('Men', 'Women', 'Mixed', 'All') DEFAULT 'All';`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN owner_remarks TEXT;`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN created_by VARCHAR(50);`); } catch (e) {}
        try { await connection.query(`ALTER TABLE tournaments ADD COLUMN approved_by VARCHAR(50);`); } catch (e) {}

        // Advertisements / Marketing Campaigns
        await connection.query(`
            CREATE TABLE IF NOT EXISTS advertisements (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50) DEFAULT 'br_001',
                name VARCHAR(150) NOT NULL,
                type VARCHAR(50) DEFAULT 'Guaranteed Booking',
                status ENUM('Active', 'Pending', 'Paused', 'Expired', 'Rejected') DEFAULT 'Active',
                icon VARCHAR(10) DEFAULT '📢',
                views INT DEFAULT 0,
                clicks INT DEFAULT 0,
                bookings INT DEFAULT 0,
                revenue INT DEFAULT 0,
                commission_paid INT DEFAULT 0,
                ctr VARCHAR(20) DEFAULT '0%',
                roi VARCHAR(20) DEFAULT '0%',
                cpa VARCHAR(20) DEFAULT '₹0',
                budget_spent INT DEFAULT 0,
                budget_total INT DEFAULT 5000,
                daily_budget INT DEFAULT 500,
                start_date VARCHAR(50),
                end_date VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Commission Management / Ad Payouts
        await connection.query(`
            CREATE TABLE IF NOT EXISTS commissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id VARCHAR(50) NOT NULL UNIQUE,
                ad_id VARCHAR(50) DEFAULT 'AD-1001',
                ad_name VARCHAR(150) NOT NULL,
                turf_name VARCHAR(100) DEFAULT 'Champions Turf Arena',
                booking_amount INT NOT NULL,
                commission_rate INT DEFAULT 12,
                commission_amount INT NOT NULL,
                owner_amount INT NOT NULL,
                invoice_no VARCHAR(50) UNIQUE NOT NULL,
                payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Discount Offers Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS discount_offers (
                id VARCHAR(50) PRIMARY KEY,
                owner_id VARCHAR(50),
                turf_id VARCHAR(50) NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                discount_type ENUM('Percentage', 'Flat Amount', 'Buy One Get One', 'Free Slot', 'Cashback') DEFAULT 'Percentage',
                discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                minimum_booking_amount DECIMAL(10, 2) DEFAULT 0.00,
                maximum_discount_amount DECIMAL(10, 2) DEFAULT 0.00,
                promo_code VARCHAR(50) UNIQUE,
                banner VARCHAR(255),
                thumbnail VARCHAR(255),
                applicable_sports TEXT,
                applicable_days TEXT,
                slot_types TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                start_time TIME DEFAULT '00:00:00',
                end_time TIME DEFAULT '23:59:59',
                usage_limit INT DEFAULT 100,
                used_count INT DEFAULT 0,
                per_user_limit INT DEFAULT 1,
                first_booking_only TINYINT(1) DEFAULT 0,
                stackable TINYINT(1) DEFAULT 0,
                auto_apply TINYINT(1) DEFAULT 0,
                target_radius DECIMAL(5, 2) DEFAULT 5.00,
                location VARCHAR(150),
                target_cities TEXT,
                gender ENUM('All', 'Male', 'Female') DEFAULT 'All',
                age_group VARCHAR(50) DEFAULT 'All Ages',
                customer_type ENUM('All Users', 'New Users', 'Existing Users', 'Premium Users') DEFAULT 'All Users',
                estimated_audience INT DEFAULT 5000,
                status ENUM('Active', 'Scheduled', 'Expired', 'Draft', 'Inactive') DEFAULT 'Active',
                created_by VARCHAR(50) DEFAULT 'SYSTEM',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Teams (Tournament Participants)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS teams (
                id VARCHAR(50) PRIMARY KEY,
                tournament_id VARCHAR(50) NOT NULL,
                team_name VARCHAR(100) NOT NULL,
                logo VARCHAR(255),
                captain_name VARCHAR(100) NOT NULL,
                captain_email VARCHAR(100) NOT NULL,
                captain_mobile VARCHAR(20) NOT NULL,
                jersey_color VARCHAR(50) DEFAULT 'Blue',
                payment_status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PAID',
                payment_method ENUM('ONLINE', 'WALLET', 'CASH', 'UPI') DEFAULT 'UPI',
                status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Team Players Roster
        await connection.query(`
            CREATE TABLE IF NOT EXISTS team_players (
                id VARCHAR(50) PRIMARY KEY,
                team_id VARCHAR(50) NOT NULL,
                player_name VARCHAR(100) NOT NULL,
                mobile VARCHAR(20),
                jersey_number INT DEFAULT 10,
                role VARCHAR(50) DEFAULT 'Player',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Fixtures / Matches
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fixtures (
                id VARCHAR(50) PRIMARY KEY,
                tournament_id VARCHAR(50) NOT NULL,
                round_name VARCHAR(100) NOT NULL,
                match_number INT DEFAULT 1,
                team1_id VARCHAR(50),
                team2_id VARCHAR(50),
                winner_team_id VARCHAR(50),
                team1_score INT DEFAULT 0,
                team2_score INT DEFAULT 0,
                scheduled_date DATE,
                scheduled_time TIME,
                court_name VARCHAR(100) DEFAULT 'Main Turf',
                slot_id VARCHAR(50),
                status ENUM('Scheduled', 'Live', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                yellow_cards INT DEFAULT 0,
                red_cards INT DEFAULT 0,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Match Detailed Scores
        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_scores (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                team_id VARCHAR(50) NOT NULL,
                points_or_goals INT DEFAULT 0,
                overs_or_minutes VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES fixtures(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournament Leaderboard Standings
        await connection.query(`
            CREATE TABLE IF NOT EXISTS leaderboards (
                id VARCHAR(50) PRIMARY KEY,
                tournament_id VARCHAR(50) NOT NULL,
                team_id VARCHAR(50) NOT NULL,
                matches_played INT DEFAULT 0,
                wins INT DEFAULT 0,
                losses INT DEFAULT 0,
                draws INT DEFAULT 0,
                goals_for INT DEFAULT 0,
                goals_against INT DEFAULT 0,
                goal_difference INT DEFAULT 0,
                points INT DEFAULT 0,
                rank_position INT DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournament Sponsors
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_sponsors (
                id VARCHAR(50) PRIMARY KEY,
                tournament_id VARCHAR(50),
                company_name VARCHAR(150) NOT NULL,
                tier ENUM('Bronze', 'Silver', 'Gold', 'Platinum') DEFAULT 'Gold',
                logo VARCHAR(255),
                website VARCHAR(255),
                package_amount INT DEFAULT 0,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournament Payments & Invoices
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tournament_id VARCHAR(50) NOT NULL,
                team_id VARCHAR(50),
                sponsor_id VARCHAR(50),
                transaction_type ENUM('Entry Fee', 'Sponsor Payment', 'Platform Commission', 'Prize Payout', 'Refund') NOT NULL,
                invoice_number VARCHAR(50) NOT NULL,
                payer_name VARCHAR(100) NOT NULL,
                amount INT NOT NULL,
                commission_amount INT DEFAULT 0,
                payment_method ENUM('UPI', 'CASH', 'CARD', 'WALLET') DEFAULT 'UPI',
                status ENUM('PENDING', 'COMPLETED', 'REFUNDED') DEFAULT 'COMPLETED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournament Notifications Log
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50),
                tournament_id VARCHAR(50),
                type ENUM('Approved', 'Rejected', 'Registration', 'Reminder', 'Winner', 'General') DEFAULT 'General',
                title VARCHAR(150) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Tournament System Settings
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tournament_settings (
                id VARCHAR(50) PRIMARY KEY,
                platform_commission_percentage FLOAT DEFAULT 10.0,
                auto_lock_slots BOOLEAN DEFAULT TRUE,
                allow_staff_create BOOLEAN DEFAULT TRUE,
                notify_on_approval BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Global Platform System & Commission Settings
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id VARCHAR(50) PRIMARY KEY,
                default_rate FLOAT DEFAULT 5.0,
                max_rate FLOAT DEFAULT 15.0,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                sports_rates JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            INSERT IGNORE INTO system_settings (id, default_rate, max_rate, status, sports_rates)
            VALUES ('global_commission', 5.0, 15.0, 'ACTIVE', '[{"sportName":"Football","commissionRate":5.0},{"sportName":"Cricket","commissionRate":5.0},{"sportName":"Badminton","commissionRate":4.0},{"sportName":"Tennis","commissionRate":4.5}]')
        `);

        // Wallet Transactions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                wallet_id VARCHAR(50) NOT NULL,
                transaction_code VARCHAR(50) UNIQUE NOT NULL,
                type ENUM('Booking', 'Tournament', 'Refund', 'Top-up', 'Prize') NOT NULL,
                description VARCHAR(255) NOT NULL,
                amount INT NOT NULL,
                status ENUM('Completed', 'Pending') DEFAULT 'Completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
            );
        `);

        // Inventory
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id VARCHAR(50) PRIMARY KEY,
                branch_id VARCHAR(50) NOT NULL,
                item_name VARCHAR(150) NOT NULL,
                category VARCHAR(100) DEFAULT 'Equipment',
                stock_quantity INT DEFAULT 0,
                min_stock_alert INT DEFAULT 5,
                price INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
            );
        `);

        // Purchase Entries (Inventory Restocking)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS purchase_entries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                inventory_id VARCHAR(50) NOT NULL,
                quantity INT NOT NULL,
                purchase_cost INT NOT NULL,
                supplier VARCHAR(150),
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
            );
        `);

        // Turfs (For Nearby Search feature)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS turfs (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                slug VARCHAR(150),
                address TEXT,
                city VARCHAR(100),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                price INT DEFAULT 0,
                rating DECIMAL(2, 1) DEFAULT 0.0,
                sports JSON,
                amenities JSON,
                opening_time TIME DEFAULT '06:00:00',
                closing_time TIME DEFAULT '23:00:00',
                media JSON,
                status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Migration check for media column in turfs
        try {
            await connection.query(`ALTER TABLE turfs ADD COLUMN media JSON;`);
        } catch (e) {
            // Column already exists, ignore
        }

        // Team Match Payment Engine Tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS slot_holds (
                id VARCHAR(50) PRIMARY KEY,
                turf_id VARCHAR(50) NOT NULL,
                slot_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                match_id VARCHAR(50) NULL,
                expires_at TIMESTAMP NOT NULL,
                status ENUM('ACTIVE', 'CONVERTED', 'EXPIRED', 'RELEASED') DEFAULT 'ACTIVE',
                INDEX idx_slot_timing (turf_id, slot_date, start_time),
                INDEX idx_expires_at (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS matches (
                id VARCHAR(50) PRIMARY KEY,
                slot_id VARCHAR(50) NOT NULL,
                turf_id VARCHAR(50) NOT NULL,
                sport_id VARCHAR(50) NOT NULL,
                captain_a_id VARCHAR(50) NOT NULL,
                captain_b_id VARCHAR(50) NULL,
                team_a_name VARCHAR(100) NOT NULL,
                team_b_name VARCHAR(100) DEFAULT 'Open Challenge',
                payment_mode ENUM('FULL_PAY', 'SPLIT_50_50', 'CUSTOM_SPLIT', 'DARE_TO_PLAY', 'PER_PLAYER') NOT NULL,
                match_status ENUM('DRAFT', 'SLOT_HELD', 'PAYMENT_PENDING', 'PARTIALLY_FUNDED', 'WAITING_FOR_OPPONENT', 'CONFIRMED', 'IN_PROGRESS', 'RESULTS_PENDING', 'SETTLEMENT_PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'DISPUTED', 'REFUND_PENDING', 'REFUNDED') DEFAULT 'DRAFT',
                total_amount INT NOT NULL,
                team_a_share INT NOT NULL,
                team_b_share INT NOT NULL,
                per_player_amount INT DEFAULT 0,
                opponent_payment_deadline TIMESTAMP NULL,
                dare_strategy ENUM('PREAUTH', 'SECURED_PREPAYMENT', 'DISABLED') DEFAULT 'SECURED_PREPAYMENT',
                financial_snapshot JSON,
                commission_rate_snapshot DECIMAL(5,2) DEFAULT 10.00,
                plan_id_snapshot VARCHAR(50) DEFAULT 'plan_starter',
                cancellation_policy_snapshot JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_match_status (match_status),
                INDEX idx_turf_id (turf_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_teams (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                team_side ENUM('A', 'B') NOT NULL,
                team_name VARCHAR(100) NOT NULL,
                captain_name VARCHAR(100),
                captain_phone VARCHAR(20),
                paid_player_count INT DEFAULT 0,
                INDEX idx_match_team (match_id, team_side)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_players (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                team_side ENUM('A', 'B') NOT NULL,
                player_name VARCHAR(100),
                player_phone VARCHAR(20),
                user_id VARCHAR(50) NULL,
                share_amount INT NOT NULL,
                payment_status ENUM('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED') DEFAULT 'CREATED',
                token_hash VARCHAR(255),
                INDEX idx_match_player (match_id, team_side)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_invites (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                team_side ENUM('A', 'B') NOT NULL,
                token_hash VARCHAR(255) NOT NULL UNIQUE,
                recipient VARCHAR(100),
                expected_amount INT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                status ENUM('SENT', 'VIEWED', 'ACCEPTED', 'PAID', 'DECLINED', 'EXPIRED', 'REVOKED') DEFAULT 'SENT',
                INDEX idx_match_invite (match_id, team_side, status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_payments (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                user_id VARCHAR(50) NULL,
                amount INT NOT NULL,
                gateway_order_id VARCHAR(100),
                gateway_payment_id VARCHAR(100) UNIQUE,
                gateway_event_id VARCHAR(100) UNIQUE,
                idempotency_key VARCHAR(100) UNIQUE,
                payment_method VARCHAR(50) DEFAULT 'UPI',
                payment_status ENUM('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED') DEFAULT 'PENDING',
                refund_reference VARCHAR(100) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_match_payment (match_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_results (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL UNIQUE,
                team_a_score_captain_a INT NULL,
                team_b_score_captain_a INT NULL,
                team_a_score_captain_b INT NULL,
                team_b_score_captain_b INT NULL,
                outcome ENUM('TEAM_A_WIN', 'TEAM_B_WIN', 'DRAW', 'DISPUTED') NULL,
                status ENUM('SUBMITTED', 'MATCHED', 'DISPUTED', 'RESOLVED') DEFAULT 'SUBMITTED',
                admin_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_settlements (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL UNIQUE,
                gross_amount INT NOT NULL,
                commission_rate DECIMAL(5,2) DEFAULT 10.00,
                platform_commission INT NOT NULL,
                owner_net_amount INT NOT NULL,
                payout_status ENUM('PAYOUT_NOT_READY', 'PAYOUT_READY', 'PAYOUT_PROCESSING', 'PAYOUT_PAID', 'PAYOUT_FAILED', 'PAYOUT_ON_HOLD') DEFAULT 'PAYOUT_NOT_READY',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS financial_ledger (
                id VARCHAR(50) PRIMARY KEY,
                transaction_id VARCHAR(100) NOT NULL,
                match_id VARCHAR(50) NOT NULL,
                payment_id VARCHAR(50) NULL,
                user_id VARCHAR(50) NULL,
                owner_id VARCHAR(50) NULL,
                type ENUM('BOOKING_PAYMENT', 'PLAYER_SHARE_PAYMENT', 'TEAM_SHARE_PAYMENT', 'DARE_AUTHORIZATION', 'DARE_CAPTURE', 'SECURITY_DEPOSIT', 'DEPOSIT_RELEASE', 'CONVENIENCE_FEE', 'PLATFORM_COMMISSION', 'OWNER_PAYABLE', 'OWNER_PAYOUT', 'REFUND', 'PARTIAL_REFUND', 'OVERPAYMENT', 'REVERSAL', 'ADJUSTMENT', 'DISPUTE_HOLD') NOT NULL,
                direction ENUM('CREDIT', 'DEBIT') NOT NULL,
                amount INT NOT NULL,
                gateway_reference VARCHAR(100),
                metadata JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_ledger_match (match_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS match_audit_logs (
                id VARCHAR(50) PRIMARY KEY,
                match_id VARCHAR(50) NOT NULL,
                actor_id VARCHAR(50) DEFAULT 'SYSTEM',
                action VARCHAR(100) NOT NULL,
                before_state JSON,
                after_state JSON,
                reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_audit_match (match_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Corporate & Bulk Booking Proposals
        await connection.query(`
            CREATE TABLE IF NOT EXISTS corporate_bookings (
                id VARCHAR(50) PRIMARY KEY,
                company_name VARCHAR(150) NOT NULL,
                contact_person VARCHAR(100),
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                event_type VARCHAR(100) DEFAULT 'Corporate Tournament',
                city VARCHAR(100) DEFAULT 'Indore',
                estimated_players VARCHAR(100) DEFAULT '10-20 Players',
                budget VARCHAR(100) DEFAULT '₹25,000 - ₹50,000',
                event_date DATE NULL,
                status ENUM('NEW', 'CONTACTED', 'QUOTATION_SENT', 'CONVERTED', 'REJECTED') DEFAULT 'NEW',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

        // Seed Subscription Plans if empty
        const [planCountRows] = await connection.query('SELECT COUNT(*) as count FROM subscription_plans');
        if (planCountRows[0].count === 0) {
            console.log('Seeding mock subscription plans...');
            await connection.query(`
                INSERT INTO subscription_plans (
                    id, plan_name, description, is_popular, status,
                    monthly_price, monthly_branch_limit, monthly_sports_limit, monthly_booking_limit, monthly_active_users_limit,
                    yearly_price, yearly_branch_limit, yearly_sports_limit, yearly_booking_limit, yearly_active_users_limit,
                    features
                ) VALUES 
                (
                    'plan_starter', 'Starter Plan', 'Ideal for single turf owners getting started.', 0, 'active',
                    999, 1, 2, 200, 5,
                    9999, 1, 2, 2500, 5,
                    '["Online Slot Booking", "Basic Analytics", "Email Notifications", "Standard Support"]'
                ),
                (
                    'plan_pro', 'Professional Plan', 'Perfect for growing multi-turf sports complexes.', 1, 'active',
                    2499, 5, 6, 1000, 20,
                    24999, 5, 6, 15000, 20,
                    '["All Starter Features", "Multi-Branch Management", "Advanced Analytics & Exports", "POS Integration", "Priority 24/7 Support"]'
                ),
                (
                    'plan_enterprise', 'Enterprise Arena', 'Custom tailored plan for large stadium & turf networks.', 0, 'active',
                    4999, 20, 15, 10000, 100,
                    49999, 20, 15, 120000, 100,
                    '["Unlimited Branches", "Dedicated Account Manager", "Custom Billing Integrations", "White Label Branding", "SLA Guarantee"]'
                );
            `);
        }

        console.log('Tables created/verified successfully.');

        // 4. Seed Mock Data if tables are empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
        if (rows[0].count === 0) {
            console.log('Seeding mock users...');
            const salt = await bcrypt.genSalt(10);
            
            // Password hashes
            const hash123456 = await bcrypt.hash('123456', salt);
            const hash123 = await bcrypt.hash('123', salt);

            // Users Seed
            await connection.query(`
                INSERT INTO users (id, name, email, password_hash, role, mobile, avatar, status) VALUES
                ('usr_superadmin_01', 'Super Administrator', 'superadmin@gmail.com', '${hash123456}', 'SUPER_ADMIN', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
                ('own_001', 'Rajesh Sharma (Turf Owner)', 'owner@gmail.com', '${hash123456}', 'OWNER', '+91 98765 12345', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
                ('usr_staff_01', 'Amit Kumar (Arena Staff)', 'staff@gmail.com', '${hash123}', 'STAFF', '+91 98765 67890', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', 'ACTIVE'),
                ('usr_customer_01', 'Rohan Verma', 'customer@gmail.com', '${hash123}', 'CUSTOMER', '+91 98765 99999', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', 'ACTIVE');
            `);

            console.log('Seeding mock branches...');
            await connection.query(`
                INSERT INTO branches (id, branch_name, branch_code, description, owner_id, subscription_plan_id, city, zip_code, full_address, email, mobile, status) VALUES
                ('br_001', 'Green Arena Football Turf', 'GA-MUM-01', 'Premium FIFA certified artificial turf with floodlights.', 'own_001', 'plan_pro', 'Mumbai', '400053', 'Andheri West, Mumbai', 'andheri@greenarena.com', '+91 98200 11111', 'ACTIVE'),
                ('br_004', 'ProPlay Arena Vashi', 'PPA-NAV-01', 'Covered rooftop multi-sport turf complex.', 'own_001', 'plan_pro', 'Navi Mumbai', '400703', 'Sector 17, Vashi', 'vashi@proplay.com', '+91 98200 55555', 'ACTIVE');
            `);

            console.log('Seeding mock sports...');
            await connection.query(`
                INSERT INTO sports (id, name, icon, category, default_slot_duration) VALUES
                ('sp_master_01', 'Football', '⚽', 'Team Sport', 60),
                ('sp_master_02', 'Cricket', '🏏', 'Team Sport', 60),
                ('sp_master_03', 'Badminton', '🏸', 'Racquet', 60),
                ('sp_master_04', 'Basketball', '🏀', 'Team Sport', 60),
                ('sp_master_05', 'Tennis', '🎾', 'Racquet', 60);
            `);

            console.log('Seeding mock branch sports...');
            await connection.query(`
                INSERT INTO branch_sports (id, branch_id, sport_id, regular_price, peak_price, total_courts, opening_time, closing_time, slot_duration, status) VALUES
                ('bs_001', 'br_001', 'sp_master_01', 1200, 1600, 2, '06:00:00', '23:00:00', 60, 'ACTIVE'),
                ('bs_002', 'br_001', 'sp_master_02', 1000, 1400, 1, '07:00:00', '22:00:00', 60, 'ACTIVE'),
                ('bs_003', 'br_001', 'sp_master_03', 600, 900, 2, '06:00:00', '22:00:00', 60, 'ACTIVE'),
                ('bs_004', 'br_001', 'sp_master_04', 1000, 1400, 1, '07:00:00', '21:00:00', 60, 'ACTIVE');
            `);

            console.log('Seeding mock holidays...');
            await connection.query(`
                INSERT INTO holidays (id, branch_id, title, holiday_date, reason, is_full_day) VALUES
                ('hol_001', 'br_001', 'Holi National Holiday', '2026-03-25', 'Public Holiday', 1),
                ('hol_002', 'br_001', 'Turf Turf Maintenance', '2026-04-10', 'Pitch Relaying', 1);
            `);

            console.log('Seeding mock wallets...');
            await connection.query(`
                INSERT INTO wallets (id, user_id, balance) VALUES
                ('wal_001', 'usr_customer_01', 500);
            `);

            console.log('Seeding mock payments/invoices...');
            await connection.query(`
                INSERT INTO payments (invoice_number, customer_name, amount, payment_method, status, created_at) VALUES
                ('INV-1001', 'Amit Sharma', 1200, 'UPI', 'COMPLETED', '2026-05-22 10:30:00'),
                ('INV-1002', 'Neha Patel', 420, 'CASH', 'COMPLETED', '2026-05-23 14:15:00'),
                ('INV-1003', 'Karan Singh', 650, 'CARD', 'COMPLETED', '2026-05-24 18:45:00'),
                ('INV-1004', 'Pooja Verma', 980, 'UPI', 'PENDING', '2026-05-25 09:00:00'),
                ('INV-1005', 'Ravi Kumar', 320, 'CASH', 'COMPLETED', '2026-05-26 12:00:00');
            `);

            console.log('Seeding mock tournaments...');
            await connection.query(`
                INSERT INTO tournaments (id, branch_id, title, description, sport_id, start_date, end_date, registration_fee, max_teams, prize_pool, status) VALUES
                ('t_001', 'br_001', 'Premier Cricket Cup', 'Indore annual cricket master tournament.', 'sp_master_02', '2026-03-15', '2026-03-20', 500, 16, '50,000', 'Active'),
                ('t_002', 'br_001', 'Indore Football Cup', '5-a-side football tournament under floodlights.', 'sp_master_01', '2026-03-22', '2026-03-25', 800, 8, '30,000', 'Upcoming'),
                ('t_003', 'br_001', 'Badminton Open Arena', 'Singles master category badminton league.', 'sp_master_03', '2026-02-28', '2026-03-02', 300, 16, '15,000', 'Completed');
            `);

            console.log('Seeding mock teams...');
            await connection.query(`
                INSERT INTO teams (id, tournament_id, team_name, captain_name, captain_email, captain_mobile, status) VALUES
                ('tm_101', 't_001', 'Indore Thunders', 'Rajesh Patel', 'rajesh@gmail.com', '9876543201', 'CONFIRMED'),
                ('tm_102', 't_001', 'Royal Challengers', 'Kunal Shah', 'kunal@gmail.com', '9876543202', 'CONFIRMED'),
                ('tm_103', 't_001', 'Warriors XI', 'Devendra Singh', 'dev@gmail.com', '9876543203', 'CONFIRMED'),
                ('tm_104', 't_001', 'Super Kings', 'Rahul Sharma', 'rahul@gmail.com', '9876543204', 'CONFIRMED'),
                ('tm_201', 't_002', 'Red Devils', 'Sunny Leone', 'sunny@gmail.com', '9876543220', 'CONFIRMED'),
                ('tm_202', 't_002', 'Blue Eagles', 'Varun Dhawan', 'varun@gmail.com', '9876543221', 'CONFIRMED');
            `);

            console.log('Seeding mock wallet transactions...');
            await connection.query(`
                INSERT INTO wallet_transactions (wallet_id, transaction_code, type, description, amount, status, created_at) VALUES
                ('wal_001', 'TXN-001', 'Booking', 'Cricket - SportZone Arena', -800, 'Completed', '2026-03-01 10:00:00'),
                ('wal_001', 'TXN-002', 'Tournament', 'PCL Entry Fee', -500, 'Completed', '2026-02-28 14:30:00'),
                ('wal_001', 'TXN-003', 'Refund', 'Booking BK-004 refund', 1200, 'Completed', '2026-02-25 18:20:00'),
                ('wal_001', 'TXN-004', 'Top-up', 'Wallet top-up', 2000, 'Completed', '2026-02-20 11:00:00'),
                ('wal_001', 'TXN-005', 'Prize', 'Cricket Tournament Winner', 5000, 'Completed', '2026-02-15 16:45:00');
            `);

            console.log('Seeding mock inventory...');
            await connection.query(`
                INSERT INTO inventory (id, branch_id, item_name, category, stock_quantity, min_stock_alert, price) VALUES
                ('item_001', 'br_001', 'Cricket Bats', 'Equipment', 12, 5, 1500),
                ('item_002', 'br_001', 'Footballs', 'Equipment', 3, 5, 1500),
                ('item_003', 'br_001', 'Shuttle Cocks (Box)', 'Consumable', 8, 10, 300),
                ('item_004', 'br_001', 'Water Bottles', 'Consumable', 48, 20, 60),
                ('item_005', 'br_001', 'First Aid Kit', 'Safety', 6, 3, 500);
            `);

            console.log('Seeding mock purchase entries...');
            await connection.query(`
                INSERT INTO purchase_entries (inventory_id, quantity, purchase_cost, supplier) VALUES
                ('item_001', 12, 1000, 'Sports Solutions Indore'),
                ('item_002', 3, 900, 'Dechatlon Indore'),
                ('item_003', 8, 200, 'Yonex Distributors');
            `);

            console.log('Seeding mock turfs...');
            await connection.query(`
                INSERT INTO turfs (id, name, slug, address, city, latitude, longitude, price, rating, sports, amenities, opening_time, closing_time) VALUES
                ('turf_1', 'Green Arena Football Turf', 'green-arena', 'Andheri West, Mumbai', 'Mumbai', 19.1136, 72.8697, 1200, 4.8, '["Football"]', '["Floodlights", "Parking", "Washroom"]', '06:00:00', '23:00:00'),
                ('turf_2', 'Champion Cricket Academy', 'champion-cricket', 'Koramangala, Bangalore', 'Bangalore', 12.9352, 77.6245, 1500, 4.9, '["Cricket"]', '["Floodlights", "Seating", "Drinking Water"]', '06:00:00', '22:00:00'),
                ('turf_4', 'Elite Sports Complex', 'elite-sports', 'Whitefield, Bangalore', 'Bangalore', 12.9698, 77.7500, 2000, 4.6, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Washroom"]', '06:00:00', '23:00:00'),
                ('turf_5', 'ProPlay Arena', 'proplay-arena', 'Vashi, Navi Mumbai', 'Mumbai', 19.0330, 73.0297, 1000, 4.5, '["Football"]', '["Floodlights", "Parking"]', '07:00:00', '23:00:00'),
                ('turf_6', 'Royal Cricket Ground', 'royal-cricket', 'Vijay Nagar, Indore', 'Indore', 22.7533, 75.8937, 600, 4.7, '["Cricket"]', '["Floodlights", "Parking", "Drinking Water"]', '06:00:00', '23:00:00'),
                ('turf_9', 'Skyline Football Turf', 'skyline-football', 'Powai, Mumbai', 'Mumbai', 19.1176, 72.9060, 1400, 4.6, '["Football"]', '["Floodlights", "Washroom"]', '06:00:00', '23:00:00'),
                ('turf_11', 'Master Blaster Cricket', 'master-blaster', 'Saket, Delhi', 'Delhi', 28.5244, 77.2167, 1100, 4.8, '["Cricket"]', '["Floodlights", "Equipment"]', '06:00:00', '23:00:00'),
                ('turf_13', 'Spike Football Turf', 'spike-football', 'Bhawarkua, Indore', 'Indore', 22.6953, 75.8690, 500, 4.6, '["Football"]', '["Floodlights", "Parking", "Washroom"]', '06:00:00', '23:00:00'),
                ('turf_14', 'Indore Sports Arena', 'indore-sports-arena', 'LIG Colony, Indore', 'Indore', 22.7380, 75.8916, 800, 4.9, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Washroom", "AC"]', '06:00:00', '23:00:00'),
                ('turf_15', 'Rajiv Gandhi Stadium Turf', 'rajiv-gandhi-stadium', 'Navlakha, Indore', 'Indore', 22.7000, 75.8752, 700, 4.5, '["Football", "Cricket"]', '["Floodlights", "Parking", "Seating", "Drinking Water"]', '06:00:00', '23:00:00');
            `);

            console.log('Mock database seeded successfully.');
        } else {
            console.log('Database already has data. Skipping seed.');
        }

    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed.');
        }
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
