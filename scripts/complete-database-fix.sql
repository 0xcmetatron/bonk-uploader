-- Drop existing tables to recreate them properly
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_key VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create files table with proper structure
CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filesize BIGINT NOT NULL,
    filetype VARCHAR(100) NOT NULL,
    base64data LONGTEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public TINYINT(1) DEFAULT 0,
    public_link VARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create chat messages table
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_public_key VARCHAR(255) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_public_key ON users(public_key);
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_upload_date ON files(upload_date);
CREATE INDEX idx_files_is_public ON files(is_public);
CREATE UNIQUE INDEX idx_files_public_link ON files(public_link);
CREATE INDEX idx_chat_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_user_public_key ON chat_messages(user_public_key);
