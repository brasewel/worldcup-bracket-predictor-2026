CREATE TABLE IF NOT EXISTS goal_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  match_num   INTEGER NOT NULL,
  minute      INTEGER,
  extra_time  INTEGER,
  scorer_name TEXT,
  team_name   TEXT,
  goal_type   TEXT,
  UNIQUE (match_num, minute, scorer_name, goal_type)
);
