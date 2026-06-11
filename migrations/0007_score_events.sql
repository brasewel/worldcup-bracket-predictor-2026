-- Goal timeline events detected by cron sync
CREATE TABLE IF NOT EXISTS score_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  match_num   INTEGER NOT NULL,
  home_score  INTEGER NOT NULL,
  away_score  INTEGER NOT NULL,
  detected_at INTEGER NOT NULL,
  UNIQUE (match_num, home_score, away_score)
);
