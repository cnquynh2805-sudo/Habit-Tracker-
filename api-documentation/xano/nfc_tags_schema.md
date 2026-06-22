# NFC Tags Table Schema

This document outlines the schema required for the `nfc_tags` table in your Xano database, mapping physical tags to specific application logic.

## Table: `nfc_tags`

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | Integer (PK) | Auto-incrementing unique identifier. |
| `tag_id` | Text | The unique physical ID (UID) of the NFC tag itself. |
| `type` | Text/Enum | Configured behavior: `MULTIPLE` (shows a list of habits) or `SINGLE` (triggers a specific habit directly). |
| `tag_name` | Text | Human-readable name for the tag (e.g. "Water Bottle Tag"). |
| `ndef_url` | Text | The payload URL encoded on the tag. |
| `habit_id` | Integer (FK) | Reference to `habits.id`. This is **Nullable** and is only required if `type` = `SINGLE`. |

## Additional Setup
- Ensure `tag_id` is indexed for fast lookup when scanning a tag.
- Create an index on `habit_id` to quickly locate tags assigned to a specific habit.
