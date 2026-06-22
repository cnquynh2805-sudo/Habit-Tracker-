# Goals Table Schema

This document outlines the schema required for the `goals` table in your Xano database, ensuring full compatibility with the frontend and business logic.

## Table: `goals`

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | Integer (Primary Key) | Auto-incrementing unique identifier. |
| `habit_id` | Table Reference (`habits.id`) | Links the goal to a specific habit. Ensure this references `id` (integer). |
| `targetType` | Text | The type of the goal. Allowed values: `streak`, `frequency`, `completion`. |
| `targetValue` | Integer | The numerical target for the goal (e.g., 30 for a 30-day streak). |
| `startDate` | Timestamp | When the goal begins. |
| `endDate` | Timestamp | When the goal ends (or deadline). |
| `status` | Text | Current status of the goal. Allowed values: `Active`, `Completed`, `Failed`. |

### Add-ons Needed for Dashboard
To optimize the `/dashboard/goals` endpoint, you should configure an Add-on on the `habits` table:
1. **Name:** `goals`
2. **Type:** List
3. **Table:** `goals`
4. **Relationship:** `habits.id = goals.habit_id`

This will automatically attach the relevant goals to each habit when queried for the dashboard.
