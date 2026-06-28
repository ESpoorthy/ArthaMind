-- =============================================================================
-- ArthaMind PostgreSQL Initialization Script
-- Runs once when the container is first created.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_crypto for password hashing utilities
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create test database (used by CI/testing)
SELECT 'CREATE DATABASE arthamind_test'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'arthamind_test'
)\gexec

GRANT ALL PRIVILEGES ON DATABASE arthamind_test TO arthamind;
