// ==========================================
// BACKGROUND TASK: daily_habit_reset
// ==========================================
// Schedule: Every day at 00:01
// Note: Ensure Xano uses "Asia/Ho_Chi_Minh" timezone for the task trigger.

// 1. Determine "yesterday" and "today"
var $now { value = "now"|to_timestamp }
var $today_day_of_week { value = $now|timestamp_day_of_week } // 0 = Sun, 1 = Mon, etc.

var $yesterday { value = $now|transform_timestamp:"-1 day" }
var $yesterday_day_of_week { value = $yesterday|timestamp_day_of_week }

// 2. Query all habits
db.query "habits" {} as $all_habits

// 3. Process each habit
array.map $all_habits {
  var $habit { value = $$ }
  
  // A. Check if the habit should be Active TODAY based on dayOfWeek array
  // Assuming $habit.frequency is an array of days (e.g. [1, 3, 5])
  var $is_active_today { value = $habit.frequency|contains:$today_day_of_week }
  
  var $new_status { value = "paused" }
  conditional {
    if ($is_active_today) {
      var.update $new_status { value = "active" }
    }
  }

  // Update Habit Status
  db.edit "habits" {
    id = $habit.id
    status = $new_status
  }

  // B. Handle Streak Reset for YESTERDAY
  // If yesterday was an active day for this habit, we must check if they hit the target.
  var $was_active_yesterday { value = $habit.frequency|contains:$yesterday_day_of_week }
  
  conditional {
    if ($was_active_yesterday) {
      // Query checkins for yesterday
      db.query "checkins" {
        where = $db.checkins.habit_id == $habit.id && $db.checkins.created_at >= $start_of_yesterday && $db.checkins.created_at <= $end_of_yesterday
      } as $yesterday_checkins

      var $total_completed { value = 0 }
      array.map $yesterday_checkins {
        var.update $total_completed { value = $total_completed + $$.completedCount }
      }

      // If they failed to meet the target yesterday...
      conditional {
        if ($total_completed < $habit.target) {
          // Reset ongoing_streak for any incomplete streak goals!
          // Since there is no "status" field, we check if ongoing_streak < targetValue
          // If ongoing_streak >= targetValue, it's already achieved, so we don't reset it.
          db.query "goals" {
            where = $db.goals.habit_id == $habit.id && $db.goals.targetType == "streak" && $db.goals.ongoing_streak < $db.goals.targetValue
          } as $failed_streak_goals

          array.map $failed_streak_goals {
            var $goal { value = $$ }
            db.edit "goals" {
              id = $goal.id
              ongoing_streak = 0
            }
          }
        }
      }
    }
  }
}
