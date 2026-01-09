-- Migration: Add votes column to applicants table
-- Run this in your Supabase SQL Editor

-- Add votes column to store officer votes as JSONB array
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS votes JSONB NOT NULL DEFAULT '[]';

-- Vote object structure:
-- [
--   {
--     "officer_id": "uuid",
--     "officer_name": "John Doe",
--     "vote_type": "up" | "down",
--     "created_at": "2026-01-09T..."
--   }
-- ]

