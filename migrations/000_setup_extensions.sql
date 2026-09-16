-- Master migration file - Run this to set up the complete database
-- Run in this order:
-- 1. 000_setup_extensions.sql (this file)
-- 2. 001_create_properties.sql
-- 3. 002_create_profile.sql
-- 4. 003_create_messages.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create shared update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;