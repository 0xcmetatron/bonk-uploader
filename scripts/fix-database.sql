-- Ensure the files table has the correct structure for public files
ALTER TABLE files 
MODIFY COLUMN is_public BOOLEAN DEFAULT FALSE,
MODIFY COLUMN public_link VARCHAR(255) NULL;

-- Make sure the public_link column has a unique index
DROP INDEX IF EXISTS idx_files_public_link;
CREATE UNIQUE INDEX idx_files_public_link ON files(public_link);

-- Ensure chat_messages table has the user_public_key column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS user_public_key VARCHAR(255) NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_user_public_key ON chat_messages(user_public_key);

-- Clean up any invalid data
UPDATE files SET is_public = FALSE WHERE is_public IS NULL;
UPDATE files SET public_link = NULL WHERE public_link = '';
