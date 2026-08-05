-- Migration: 001_create_owners_table.sql
-- Description: Create owners table with personal, business, address, and profile fields

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
    profile_image VARCHAR(255),
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
