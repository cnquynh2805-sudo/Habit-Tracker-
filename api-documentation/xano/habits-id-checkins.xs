// Implementation of core feature 8 (UX & Error Handling) and data integrity for check-ins.
// This logic ensures completion count does not exceed daily target and prevents duplicate daily records.
query "habits/{id}/checkins" verb=POST {
  api_group = "Habit Tracker"

  input {
    int id {
      table = "habits"
    }
  
    // The timestamp for the check-in
    timestamp date
  
    // Number of times the habit was performed today
    int completedCount
  }

  stack {
    // 1. Get the habit record to retrieve its targetPerDay
    db.get habits {
      field_name = "id"
      field_value = $input.id
    } as $habit
  
    precondition ($habit != null) {
      error_type = "notfound"
      error = "Habit not found"
    }
  
    // 2. Precondition (Requirement 6): Completed count cannot exceed the daily target
    precondition ($input.completedCount <= $habit.targetPerDay) {
      error_type = "inputerror"
      error = "Completed count cannot exceed the daily target"
    }
  
    // 3. Format date_only for uniqueness and data integrity (Requirement 7)
    var $date_only {
      value = $input.date|format_timestamp:"Y-m-d"
    }
  
    // 4. Determine status based on progress
    var $status {
      value = "In Progress"
    }
  
    conditional {
      if ($input.completedCount >= $habit.targetPerDay) {
        var.update $status {
          value = "Completed"
        }
      }
    
      elseif ($input.completedCount == 0) {
        var.update $status {
          value = "Not Started"
        }
      }
    }
  
    // 5. Database Request -> Add or Edit Record (checkins) (Requirement 7)
    // Find existing check-in for this habit on this specific date_only
    db.query checkins {
      where = $db.checkins.habit_id == $input.id && $db.checkins.date_only == $date_only
      return = {type: "single"}
    } as $existing_checkin
  
    // If it exists, update it (PATCH); otherwise, create it (POST)
    conditional {
      if ($existing_checkin != null) {
        db.edit checkins {
          field_name = "id"
          field_value = $existing_checkin.id
          data = {
            date          : $input.date
            date_only     : $date_only
            completedCount: $input.completedCount
            status        : $status
          }
        } as $checkin
      }
    
      else {
        db.add checkins {
          data = {
            habit_id      : $input.id
            date          : $input.date
            date_only     : $date_only
            completedCount: $input.completedCount
            status        : $status
          }
        } as $checkin
      }
    }
  }

  response = $checkin
}