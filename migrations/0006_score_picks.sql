-- Group stage score predictions (e.g. 2-1)
CREATE TABLE IF NOT EXISTS score_picks (
  email      TEXT NOT NULL,
  match_id   TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  picked_at  INTEGER NOT NULL,
  PRIMARY KEY (email, match_id)
);
