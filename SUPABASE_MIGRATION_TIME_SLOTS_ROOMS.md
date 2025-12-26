# Supabase Migration: Time Slots with Room Support

This migration adds room support to the time slots system and creates the interview schedule for Saturday, January 10th.

## Database Changes Required

### 1. Add `room` Column to time_slots Table

The `time_slots` table needs a new `room` field to distinguish between different rooms for the same time period.

```sql
-- Add room column to existing time_slots table
ALTER TABLE time_slots
ADD COLUMN room TEXT NOT NULL DEFAULT 'Room 1';
```

### 2. Deactivate Existing Time Slots

Before inserting the new schedule, deactivate old time slots (they won't be deleted, just hidden):

```sql
-- Deactivate all existing time slots
UPDATE time_slots
SET is_active = false;
```

### 3. Insert New Time Slots for Saturday, January 10th

Create 16 time slots (8 time periods × 2 rooms):

```sql
-- Insert new time slots for Saturday, January 10th
-- Morning slots: 9 AM - 12 PM
INSERT INTO time_slots (day_of_week, start_time, end_time, room, display_label, max_capacity, is_active) VALUES
-- 9:00 - 10:00 AM
('Saturday', '09:00', '10:00', 'Room 1', 'Saturday 9:00-10:00 AM (Room 1)', 4, true),
('Saturday', '09:00', '10:00', 'Room 2', 'Saturday 9:00-10:00 AM (Room 2)', 4, true),

-- 10:00 - 11:00 AM
('Saturday', '10:00', '11:00', 'Room 1', 'Saturday 10:00-11:00 AM (Room 1)', 4, true),
('Saturday', '10:00', '11:00', 'Room 2', 'Saturday 10:00-11:00 AM (Room 2)', 4, true),

-- 11:00 AM - 12:00 PM
('Saturday', '11:00', '12:00', 'Room 1', 'Saturday 11:00 AM-12:00 PM (Room 1)', 4, true),
('Saturday', '11:00', '12:00', 'Room 2', 'Saturday 11:00 AM-12:00 PM (Room 2)', 4, true),

-- Afternoon slots: 1 PM - 6 PM (12:00-1:00 PM is break time)

-- 1:00 - 2:00 PM
('Saturday', '13:00', '14:00', 'Room 1', 'Saturday 1:00-2:00 PM (Room 1)', 4, true),
('Saturday', '13:00', '14:00', 'Room 2', 'Saturday 1:00-2:00 PM (Room 2)', 4, true),

-- 2:00 - 3:00 PM
('Saturday', '14:00', '15:00', 'Room 1', 'Saturday 2:00-3:00 PM (Room 1)', 4, true),
('Saturday', '14:00', '15:00', 'Room 2', 'Saturday 2:00-3:00 PM (Room 2)', 4, true),

-- 3:00 - 4:00 PM
('Saturday', '15:00', '16:00', 'Room 1', 'Saturday 3:00-4:00 PM (Room 1)', 4, true),
('Saturday', '15:00', '16:00', 'Room 2', 'Saturday 3:00-4:00 PM (Room 2)', 4, true),

-- 4:00 - 5:00 PM
('Saturday', '16:00', '17:00', 'Room 1', 'Saturday 4:00-5:00 PM (Room 1)', 4, true),
('Saturday', '16:00', '17:00', 'Room 2', 'Saturday 4:00-5:00 PM (Room 2)', 4, true),

-- 5:00 - 6:00 PM
('Saturday', '17:00', '18:00', 'Room 1', 'Saturday 5:00-6:00 PM (Room 1)', 4, true),
('Saturday', '17:00', '18:00', 'Room 2', 'Saturday 5:00-6:00 PM (Room 2)', 4, true);
```

## Migration Steps

### Option 1: Run All Steps Together (Recommended)

Run this complete script in the Supabase SQL Editor:

```sql
-- Step 1: Add room column
ALTER TABLE time_slots
ADD COLUMN room TEXT NOT NULL DEFAULT 'Room 1';

-- Step 2: Deactivate old slots
UPDATE time_slots
SET is_active = false;

-- Step 3: Insert new slots for Saturday, January 10th
INSERT INTO time_slots (day_of_week, start_time, end_time, room, display_label, max_capacity, is_active) VALUES
('Saturday', '09:00', '10:00', 'Room 1', 'Saturday 9:00-10:00 AM (Room 1)', 4, true),
('Saturday', '09:00', '10:00', 'Room 2', 'Saturday 9:00-10:00 AM (Room 2)', 4, true),
('Saturday', '10:00', '11:00', 'Room 1', 'Saturday 10:00-11:00 AM (Room 1)', 4, true),
('Saturday', '10:00', '11:00', 'Room 2', 'Saturday 10:00-11:00 AM (Room 2)', 4, true),
('Saturday', '11:00', '12:00', 'Room 1', 'Saturday 11:00 AM-12:00 PM (Room 1)', 4, true),
('Saturday', '11:00', '12:00', 'Room 2', 'Saturday 11:00 AM-12:00 PM (Room 2)', 4, true),
('Saturday', '13:00', '14:00', 'Room 1', 'Saturday 1:00-2:00 PM (Room 1)', 4, true),
('Saturday', '13:00', '14:00', 'Room 2', 'Saturday 1:00-2:00 PM (Room 2)', 4, true),
('Saturday', '14:00', '15:00', 'Room 1', 'Saturday 2:00-3:00 PM (Room 1)', 4, true),
('Saturday', '14:00', '15:00', 'Room 2', 'Saturday 2:00-3:00 PM (Room 2)', 4, true),
('Saturday', '15:00', '16:00', 'Room 1', 'Saturday 3:00-4:00 PM (Room 1)', 4, true),
('Saturday', '15:00', '16:00', 'Room 2', 'Saturday 3:00-4:00 PM (Room 2)', 4, true),
('Saturday', '16:00', '17:00', 'Room 1', 'Saturday 4:00-5:00 PM (Room 1)', 4, true),
('Saturday', '16:00', '17:00', 'Room 2', 'Saturday 4:00-5:00 PM (Room 2)', 4, true),
('Saturday', '17:00', '18:00', 'Room 1', 'Saturday 5:00-6:00 PM (Room 1)', 4, true),
('Saturday', '17:00', '18:00', 'Room 2', 'Saturday 5:00-6:00 PM (Room 2)', 4, true);
```

### Option 2: Manual Steps via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run each SQL statement from Option 1 separately
4. Verify the changes in the Table Editor

## Verification

After running the migration, verify the changes:

```sql
-- Check that room column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'time_slots' AND column_name = 'room';

-- Verify 16 new active slots were created
SELECT COUNT(*) as active_slots
FROM time_slots
WHERE is_active = true;
-- Should return: 16

-- View all new time slots grouped by time period
SELECT day_of_week, start_time, end_time, room, display_label, max_capacity
FROM time_slots
WHERE is_active = true
ORDER BY start_time, room;
```

## Schedule Summary

**Date:** Saturday, January 10th
**Total Time Periods:** 8
**Total Room Slots:** 16
**Max Capacity:** 64 applicants (4 per room)

| Time Period | Room 1 Capacity | Room 2 Capacity | Total |
|-------------|----------------|----------------|-------|
| 9:00-10:00 AM | 4 | 4 | 8 |
| 10:00-11:00 AM | 4 | 4 | 8 |
| 11:00 AM-12:00 PM | 4 | 4 | 8 |
| **12:00-1:00 PM** | **BREAK** | **BREAK** | **0** |
| 1:00-2:00 PM | 4 | 4 | 8 |
| 2:00-3:00 PM | 4 | 4 | 8 |
| 3:00-4:00 PM | 4 | 4 | 8 |
| 4:00-5:00 PM | 4 | 4 | 8 |
| 5:00-6:00 PM | 4 | 4 | 8 |
| **Total** | **32** | **32** | **64** |

## Rollback (If Needed)

If you need to rollback the changes:

```sql
-- Remove the room column
ALTER TABLE time_slots
DROP COLUMN room;

-- Reactivate old time slots
UPDATE time_slots
SET is_active = true
WHERE day_of_week != 'Saturday';

-- Delete Saturday slots
DELETE FROM time_slots
WHERE day_of_week = 'Saturday';
```

## Code Changes Required

After running this migration, deploy the following code changes:
- `types/index.ts` - Add room field to TimeSlot interface
- `app/apply/page.tsx` - Group time slots by period for applicant display
- `app/dashboard/schedule/page.tsx` - Show rooms separately for officers
- `lib/autoAssign.ts` - Balance assignments across rooms
