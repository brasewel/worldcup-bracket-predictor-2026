-- Golden Boot top-scorer predictions
CREATE TABLE IF NOT EXISTS golden_boot_picks (
  email       TEXT PRIMARY KEY,
  player_name TEXT NOT NULL,
  picked_at   INTEGER NOT NULL
);
