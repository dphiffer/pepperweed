--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

INSERT INTO option (key, value) VALUES ('title', 'Peperweed');

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DELETE FROM option WHERE key = 'title';