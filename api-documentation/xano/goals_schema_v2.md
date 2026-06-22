# Goals Table Schema V2 (Single Table Inheritance)

This schema reflects the updated database design for the `goals` table using Single Table Inheritance. Do not drop the table; **Add** the new columns to the existing schema.

## Existing Columns (Do not modify)
- `id` (integer, Primary Key)
- `habit_id` (integer, FK to `habits.id`)
- `targetValue` (integer) - The numeric goal target (e.g. 30).
- `reward_item_id` (integer, FK)

## Columns to Update
- `targetType` (Text/Enum) - Add new options: `streak`, `totalCompletions` to the enum.

## New Columns to Add
| Column Name | Type | Default Value | Description |
|-------------|------|---------------|-------------|
| `ongoing_streak` | Integer | `0` | Tracks consecutive successful days. Only used if `targetType` is `streak`. |
| `current_completions`| Integer | `0` | Tracks total completed sessions. Only used if `targetType` is `totalCompletions`. |
| `startDate` | Timestamp | `now` | The date the goal was started. |

*Note: `endDate` and `status` have been removed as goals are persistent until achieved (no fail state).*
