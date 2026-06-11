-- Schedule quick-picks (winner of a specific match)
CREATE TABLE IF NOT EXISTS live_picks (
  email      TEXT NOT NULL,
  match_id   TEXT NOT NULL,
  team       TEXT NOT NULL,
  picked_at  INTEGER NOT NULL,
  PRIMARY KEY (email, match_id)
);
