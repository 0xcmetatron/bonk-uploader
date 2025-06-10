-- Verify the database structure
DESCRIBE files;
DESCRIBE users;
DESCRIBE chat_messages;

-- Check if there are any files and their public status
SELECT id, filename, is_public, public_link FROM files ORDER BY id DESC LIMIT 10;

-- Check users
SELECT id, nickname, public_key FROM users ORDER BY id DESC LIMIT 5;

-- Check chat messages
SELECT id, nickname, message, user_public_key FROM chat_messages ORDER BY id DESC LIMIT 5;
