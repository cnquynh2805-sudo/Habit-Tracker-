query "system/reset" verb=POST {
  api_group = "Habit Tracker"

  input {
  }

  stack {
    // Dùng db.truncate để xoá sạch dữ liệu và reset ID (auto-increment) về 1
    db.truncate checkins {
      reset = true
    }
  
    db.truncate goals {
      reset = true
    }
  
    db.truncate habits {
      reset = true
    }
  
    // db.truncate "nfc_tags" { reset = true }
  
    // Nếu bạn có bảng users và muốn xoá sạch cả user thì bỏ comment dòng dưới:
    // db.truncate "users" { reset = true }
  
    var $result {
      value = {
        success: true
        message: "Toàn bộ dữ liệu hệ thống đã được dọn dẹp sạch sẽ!"
      }
    }
  }

  response = $result
}