// ==========================================
// ENDPOINT: GET /nfc-tags
// ==========================================
db.query "nfc_tags" {} as $nfc_tags
return { value = $nfc_tags }

// ==========================================
// ENDPOINT: POST /nfc-tags
// ==========================================
// Payload: tag_id, type, tag_name, ndef_url, habit_id (optional)

// Precondition validation
conditional {
  if ($input.type == "SINGLE" && $input.habit_id|is_null) {
    throw {
      name = "ValidationError"
      value = "habit_id is required when type is SINGLE"
    }
  }
}

db.add "nfc_tags" {
  tag_id = $input.tag_id
  type = $input.type
  tag_name = $input.tag_name
  ndef_url = $input.ndef_url
  habit_id = $input.habit_id
} as $new_tag

return { value = $new_tag }

// ==========================================
// ENDPOINT: PATCH /nfc-tags/{id}
// ==========================================
// Fetch the existing tag
db.get "nfc_tags" { id = $input.id } as $existing_tag

// Update fields dynamically
var $updated_tag { value = $existing_tag }
var.update $updated_tag { value = $updated_tag|set_ifnotnull:"tag_name":$input.tag_name }
var.update $updated_tag { value = $updated_tag|set_ifnotnull:"ndef_url":$input.ndef_url }

conditional {
  if ($input.type != null) {
    var.update $updated_tag { value = $updated_tag|set:"type":$input.type }
    var.update $updated_tag { value = $updated_tag|set:"habit_id":$input.habit_id }
    
    // Validate again
    if ($updated_tag.type == "SINGLE" && $updated_tag.habit_id|is_null) {
      throw {
        name = "ValidationError"
        value = "habit_id is required when type is SINGLE"
      }
    }
  }
}

// Save back
db.edit "nfc_tags" {
  id = $updated_tag.id
  type = $updated_tag.type
  tag_name = $updated_tag.tag_name
  ndef_url = $updated_tag.ndef_url
  habit_id = $updated_tag.habit_id
}

return { value = $updated_tag }

// ==========================================
// ENDPOINT: DELETE /nfc-tags/{id}
// ==========================================
db.delete "nfc_tags" {
  id = $input.id
}
return { value = { "success": true, "message": "Tag deleted successfully" } }
