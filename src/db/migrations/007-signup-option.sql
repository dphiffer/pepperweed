--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

INSERT INTO option (key, value) VALUES ('signupEnabled', '1');

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DELETE FROM option WHERE key = 'signupEnabled';
