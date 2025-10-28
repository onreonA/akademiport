-- =====================================================
-- EXTENSIONS
-- =====================================================
-- PostgreSQL extensions that we need

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search (Turkish support)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Case-insensitive text type
CREATE EXTENSION IF NOT EXISTS "citext";

