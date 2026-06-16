# Agile User Stories & Architectural Trade-offs

## Part 1: Agile User Stories

### Epic 1: Habit Management
- **Story 1.1:** As a user, I want to create a new habit with a name, category, frequency, target per day, and priority, so that I can establish a tracking baseline.
- **Story 1.2:** As a user, I want to view my habits filtered by category, frequency, priority, or status, so that I can easily find what I need to work on.
- **Story 1.3:** As a user, I want to update the status of a habit (Active, Paused, Archived) so that I can pause tracking when I am on vacation without breaking my streak.
- **Story 1.4:** As a user, I want any habits with missed check-ins for the current day to be visually highlighted, so that I don't forget to complete them.

### Epic 2: Daily Check-in Tracking
- **Story 2.1:** As a user, I want to record my progress (completed count) for a specific habit on the current date, so that I can maintain my daily streaks.
- **Story 2.2:** As a user, I want to mark a habit as completely done for the day with a single action, so that I can quickly log my activities.
- **Story 2.3:** As a user, I want to undo my very last check-in action, so that I can quickly correct a mistake without ruining my data.

### Epic 3: Goal & Progress Management
- **Story 3.1:** As a user, I want to set a measurable goal (Streak or Total Completions) for a habit, so that I have a clear milestone to work towards.
- **Story 3.2:** As a user, I want to see an encouragement message when I reach 80% of my goal, so that I stay motivated near the finish line.
- **Story 3.3:** As a user, I want to see an alert when I reach 100% of my goal, so that I can celebrate my achievement.

### Epic 4: Dashboard & Mascot Rewards
- **Story 4.1:** As a user, I want to see a dashboard summarizing my current streaks, longest streaks, and completion rates over the last 7 days, so that I can review my performance.
- **Story 4.2:** As a user, I want to see how many habits are at risk of breaking a streak today, so that I can prioritize my tasks.
- **Story 4.3:** As a user, I want to automatically receive and equip a mascot reward item immediately after achieving a goal milestone, so that I feel rewarded for my consistency.

---

## Part 2: Architectural Trade-off Log

### Epic: Habit Management
**Decision: Flat Root Paths vs. User-Nested Sub-resources**
- **Approach:** We chose flat, top-level routes (e.g., `GET /habits`, `PATCH /habits/{id}/status`) rather than nesting them under a user context (e.g., `GET /users/{userId}/habits`).
- **Reasoning:** Since the technical constraints explicitly state "No authentication", the application operates in a single-user context (persisted locally). Adding user-level sub-resource routing would introduce unnecessary complexity to both the UI state and API layer.
- **Trade-off:** This makes the API purely single-tenant. If authentication is introduced in the future, the routes will either need to rely on secure JWT headers for context, or undergo a structural refactor to accommodate multi-tenancy.

### Epic: Daily Check-ins
**Decision: Flat Checkin Collection vs. Habit-Nested Checkins**
- **Approach:** We opted for a top-level `/checkins` resource where `habitId` and `date` are queried (e.g., `GET /checkins?date=2026-06-15`), rather than nesting them (`GET /habits/{id}/checkins`).
- **Reasoning:** The most critical view in the application is the "Today Screen", which requires fetching all check-ins for the *current day* across *all* habits. A flat structure allows us to make a single query filtering by date.
- **Trade-off:** If we used a nested structure, the frontend would have to loop through all active habits and make N+1 API calls to fetch today's check-in for each one. The flat structure prevents the N+1 problem but requires slightly more filtering logic on the mock API side.

### Epic: Goals & Derived State
**Decision: Dynamically Derived Progress vs. Persisted State Mutation**
- **Approach:** The progress of a goal is never stored in the database. Instead, the frontend calls `GET /goals/{id}/progress`, and the Mock API dynamically calculates it by traversing the `checkins` table.
- **Reasoning:** This strictly enforces NFR1 ("Avoid duplicated state"). If we stored `currentProgress` as a field on the Goal table, every `POST /checkins` would require a simultaneous `PUT /goals` to keep them synchronized, risking data drift.
- **Trade-off:** This introduces higher computational complexity and O(N) read operations on the API side when retrieving goal statuses, as the server must aggregate historical data on the fly. However, given the local/mocked nature of the app and small data sizes, consistency guarantees significantly outweigh the computational overhead.

### Epic: Dashboard Statistics
**Decision: Pre-Calculated API Responses vs. Client-Side Crunching**
- **Approach:** The API exposes `/dashboard/summary` and `/dashboard/habits-grouped`, returning pre-calculated metrics (e.g., `completionRateLast7Days`, `habitsAtRiskCount`).
- **Reasoning:** By pushing the calculation to the Mock API/Beeceptor layer, the React frontend remains highly performant and strictly focused on rendering. This establishes a clean "Backend-for-Frontend" (BFF) pattern.
- **Trade-off:** It couples the API heavily to the specific UI views. If the dashboard UI changes to require different metrics, the API must be rewritten. Conversely, if the frontend downloaded the raw data to calculate locally, the UI would be more flexible but would suffer from much larger network payloads.
