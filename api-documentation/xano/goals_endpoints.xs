// ==========================================
// API ENDPOINT: POST /habits/{id}/goals
// ==========================================
query "habits/{id}/goals" verb=POST {
  api_group = "Habit Tracker"

  input {
    int id {
      table = "habits"
    }
    text targetType
    int targetValue
  }

  stack {
    db.add goals {
      data = {
        habit_id            : $input.id
        targetType          : $input.targetType
        targetValue         : $input.targetValue
        current_completions : 0
        ongoing_streak      : 0
      }
    } as $goal
  }

  response = $goal
}

// ==========================================
// API ENDPOINT: GET /dashboard/goals
// ==========================================
query "dashboard/goals" verb=GET {
  api_group = "Habit Tracker"

  input {}

  stack {
    // 1. Fetch all goals and JOIN with habits table automatically
    db.query "goals" {
      join = {
        habit: {
          table: "habits",
          type: "inner",
          where: $db.goals.habit_id == $db.habit.id
        }
      }
      eval = {
        habitName: $db.habit.name,
        category: $db.habit.category
      }
    } as $all_goals

    var $goalsList { value = [] }

    // 2. Loop through goals to calculate progress
    foreach ($all_goals) {
      each as $goal {
        var $progress { value = 0 }
        
        // Xác định tiến độ hiện tại dựa trên loại goal
        conditional {
          if ($goal.targetType == "streak") {
            var.update $progress { value = $goal.ongoing_streak }
          } else {
            var.update $progress { value = $goal.current_completions }
          }
        }
        
        // Tính phần trăm & giá trị còn lại
        // XanoScript sử dụng các hàm filter cho toán học
        var $progressPercent { value = $progress|div:$goal.targetValue|mul:100 }
        var $remainingValue { value = $goal.targetValue|sub:$progress }
        
        conditional {
          if ($remainingValue < 0) {
            var.update $remainingValue { value = 0 }
          }
        }
        conditional {
          if ($progressPercent > 100) {
            var.update $progressPercent { value = 100 }
          }
        }

        // Tạo object format cho frontend
        var $formatted_goal {
          value = {
            habitId: $goal.habit_id,
            habitName: $goal.habitName,
            category: $goal.category,
            goal: {
              id: $goal.id,
              targetType: $goal.targetType,
              targetValue: $goal.targetValue,
              currentProgress: $progress,
              progressPercent: $progressPercent,
              remainingValue: $remainingValue
            }
          }
        }
        
        // Đẩy vào mảng kết quả (sử dụng filter push của Xano)
        var.update $goalsList { value = $goalsList|push:$formatted_goal }
      }
    }

    var $data {
      value = {
        goalsList: $goalsList
      }
    }
  }

  response = $data
}
