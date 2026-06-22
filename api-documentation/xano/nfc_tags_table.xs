table nfc_tags {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    text tag_id
    text type
    text tag_name
    text ndef_url
    int habit_id
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "tag_id"}]}
    {type: "btree", field: [{name: "habit_id"}]}
  ]
}
