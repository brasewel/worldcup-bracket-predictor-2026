-- Live group standings synced from football-data.org
CREATE TABLE IF NOT EXISTS group_standings (
  group_letter TEXT NOT NULL,
  position     INTEGER NOT NULL,
  team_name    TEXT NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (group_letter, position)
);
