--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

ALTER TABLE post ADD COLUMN user_id INTEGER;
ALTER TABLE post ADD COLUMN attributes TEXT;
ALTER TABLE post ADD COLUMN visibility TEXT DEFAULT private;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------
