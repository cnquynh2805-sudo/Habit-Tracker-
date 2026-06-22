// ==========================================
// API ENDPOINT: POST /checkins
// ==========================================
// Free Tier Workaround: No background tasks allowed.
// We embed the streak-reset lazy evaluation directly into the checkin process.
// Even if not 100% bulletproof for multi-day absences, it handles the daily UX.

query checkins verb=POST {
  api_group = "Habit Tracker"

  input {
    dblink {
      table = "checkins"
    }
  }

  stack {
    // 1. Add the checkin record
    db.add checkins {
      enforce_hidden_fields = false
      data = {
        habit_id      : $input.habit_id
        date          : $input.date
        date_only     : "now"
        completedCount: $input.completedCount
        status        : $input.status
      }
    } as $model

    // 2. Fetch the associated Habit to check its daily Target and frequency
    db.get "habits" {
      field_name = "id"
      field_value = $input.habit_id
    } as $habit

    // ---------------------------------------------------------
    // FREE TIER WORKAROUND: LAZY STREAK RESET
    // Check if they missed "yesterday" before we process "today"
    // ---------------------------------------------------------
    var $now { value = "now"|to_timestamp }
    var $yesterday { value = $now|transform_timestamp:"-1 day" }
    var $yesterday_day_of_week { value = $yesterday|format_timestamp:"D" }
    
    // Calculate start and end of days
    var $start_of_day { value = $now|format_timestamp:"Y-m-d"|to_timestamp }
    var $start_of_yesterday { value = $yesterday|format_timestamp:"Y-m-d"|to_timestamp }
    
    var $was_active_yesterday { value = false }
    conditional {
      if ($habit.frequency == "Daily") {
        var.update $was_active_yesterday { value = true }
      }
      elseif ($habit.daysOfWeek != null) {
        conditional {
          if ($habit.daysOfWeek|contains:$yesterday_day_of_week) {
            var.update $was_active_yesterday { value = true }
          }
        }
      }
    }
    
    conditional {
      if ($was_active_yesterday) {
        // Query checkins for this habit yesterday
        db.query "checkins" {
          where = $db.checkins.habit_id == $habit.id && $db.checkins.date >= $start_of_yesterday && $db.checkins.date < $start_of_day
        } as $yesterday_checkins

        var $total_yesterday { value = 0 }
        foreach ($yesterday_checkins) {
          each as $checkin {
            var.update $total_yesterday { value = $total_yesterday|add:$checkin.completedCount }
          }
        }

        // If they failed to meet the target yesterday, reset their streak BEFORE adding today's progress
        conditional {
          if ($total_yesterday < $habit.targetPerDay) {
            db.query "goals" {
              where = $db.goals.habit_id == $habit.id && $db.goals.targetType == "streak" && $db.goals.ongoing_streak < $db.goals.targetValue
            } as $failed_streak_goals

            foreach ($failed_streak_goals) {
              each as $goal {
                db.edit "goals" {
                  field_name = "id"
                  field_value = $goal.id
                  data = {
                    ongoing_streak: 0
                  }
                }
              }
            }
          }
        }
      }
    }

    // ---------------------------------------------------------
    // 3. PROCESS TODAY'S GOAL PROGRESS
    // ---------------------------------------------------------
    // Fetch all checkins for this habit TODAY
    db.query "checkins" {
      where = $db.checkins.habit_id == $habit.id && $db.checkins.date >= $start_of_day
    } as $todays_checkins

    var $total_completed { value = 0 }
    foreach ($todays_checkins) {
      each as $checkin {
        var.update $total_completed { value = $total_completed|add:$checkin.completedCount }
      }
    }

    conditional {
      if ($total_completed >= $habit.targetPerDay) {
        // ONLY update goals if the daily target is MET!
        db.query "goals" {
          where = $db.goals.habit_id == $habit.id
        } as $all_goals

        foreach ($all_goals) {
          each as $goal {
            var $is_updated { value = false }

            conditional {
              if ($goal.targetType == "totalCompletions" && $goal.current_completions < $goal.targetValue) {
                var.update $goal.current_completions { value = $goal.current_completions|add:1 }
                var.update $is_updated { value = true }
              }
              elseif ($goal.targetType == "streak" && $goal.ongoing_streak < $goal.targetValue) {
                var.update $goal.ongoing_streak { value = $goal.ongoing_streak|add:1 }
                var.update $is_updated { value = true }
              }
            }

            conditional {
              if ($is_updated) {
                db.edit "goals" {
                  field_name = "id"
                  field_value = $goal.id
                  data = {
                    current_completions: $goal.current_completions,
                    ongoing_streak: $goal.ongoing_streak
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  response = $model
}
