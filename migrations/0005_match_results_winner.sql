-- Add winner column and halftime scores to match_results
ALTER TABLE match_results ADD COLUMN winner TEXT;
ALTER TABLE match_results ADD COLUMN home_score_ht INTEGER;
ALTER TABLE match_results ADD COLUMN away_score_ht INTEGER;
