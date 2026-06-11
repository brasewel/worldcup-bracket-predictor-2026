CREATE TABLE IF NOT EXISTS card_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  match_num   INTEGER NOT NULL,
  minute      INTEGER,
  player_name TEXT,
  team_name   TEXT,
  card_type   TEXT,
  UNIQUE (match_num, minute, player_name, card_type)
);
