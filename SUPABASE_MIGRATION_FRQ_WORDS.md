# Supabase Migration: FRQ Character Limit to Word Limit

This migration updates the FRQ questions in the config table to use word limits instead of character limits.

## Database Changes Required

### Update the config table's frq_questions JSON structure

The `frq_questions` field in the `config` table needs to be updated from using `max_chars` to `max_words`.

### Before (Old Structure):
```json
{
  "frq_questions": [
    {
      "id": "q1",
      "question": "Why do you want to join ICG?",
      "max_chars": 500
    },
    {
      "id": "q2",
      "question": "What skills do you bring to our team?",
      "max_chars": 750
    }
  ]
}
```

### After (New Structure):
```json
{
  "frq_questions": [
    {
      "id": "q1",
      "question": "Why do you want to join ICG?",
      "max_words": 100
    },
    {
      "id": "q2",
      "question": "What skills do you bring to our team?",
      "max_words": 150
    }
  ]
}
```

## Migration Steps

### Option 1: Manual Update via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Open the `config` table
4. Find your config row and click to edit the `frq_questions` JSON field
5. Replace `max_chars` with `max_words` for each question
6. Update the numeric values to reflect word limits instead of character limits
   - General conversion: ~5 characters per word average
   - Example: 500 characters ≈ 100 words
7. Save the changes

### Option 2: SQL Update Script

Run this SQL script in the Supabase SQL Editor:

```sql
-- This is a template - you'll need to customize the JSON based on your actual questions
UPDATE config
SET frq_questions = '[
  {
    "id": "q1",
    "question": "Why do you want to join ICG?",
    "max_words": 100
  },
  {
    "id": "q2",
    "question": "What skills do you bring to our team?",
    "max_words": 150
  }
]'::jsonb
WHERE id = 'your-config-id';
```

## Conversion Guidelines

When converting from character limits to word limits:
- **500 characters** ≈ **100 words**
- **750 characters** ≈ **150 words**
- **1000 characters** ≈ **200 words**
- **1500 characters** ≈ **300 words**

Average word length: ~4-5 characters + 1 space = ~5-6 characters per word

## Code Changes (Already Applied)

- ✅ Updated TypeScript interface: `FRQQuestion.max_chars` → `FRQQuestion.max_words`
- ✅ Updated form validation to count words instead of characters
- ✅ Updated display counter to show "X / Y words" instead of character count
- ✅ Added word counting function that splits by whitespace

## Testing

After migration:
1. Navigate to `/apply`
2. Fill out the application form
3. Check that FRQ questions show word counts (e.g., "0 / 100 words")
4. Verify that word limit validation works correctly
5. Test that you cannot exceed the word limit

## Rollback (If Needed)

If you need to rollback, change `max_words` back to `max_chars` in the database and revert the code changes in:
- `types/index.ts`
- `app/apply/page.tsx`
