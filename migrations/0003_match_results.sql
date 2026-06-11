-- Real-world match results synced from football-data.org
CREATE TABLE IF NOT EXISTS match_results (
  fd_match_id  INTEGER PRIMARY KEY,
  match_num    INTEGER NOT NULL,
  home_team    TEXT,
  away_team    TEXT,
  home_score   INTEGER,
  away_score   INTEGER,
  status       TEXT NOT NULL,
  updated_at   INTEGER NOT NULL
);
