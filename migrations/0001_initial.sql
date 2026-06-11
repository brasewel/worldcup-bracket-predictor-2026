-- Initial brackets table
CREATE TABLE IF NOT EXISTS brackets (
  email        TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  bracket_data TEXT NOT NULL,
  locked       INTEGER NOT NULL DEFAULT 0,
  updated_at   INTEGER NOT NULL
);
