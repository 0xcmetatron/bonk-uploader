-- Update chat_messages table to include user_public_key for admin identification
ALTER TABLE chat_messages 
ADD COLUMN user_public_key VARCHAR(255) NULL;

-- Create index for better performance
CREATE INDEX idx_chat_user_public_key ON chat_messages(user_public_key);

-- Update files table to ensure public columns exist (in case they weren't added before)
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_link VARCHAR(255) UNIQUE NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_files_public_link ON files(public_link);
CREATE INDEX IF NOT EXISTS idx_files_is_public ON files(is_public);
