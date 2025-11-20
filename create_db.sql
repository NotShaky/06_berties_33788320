-- Create database script for Berties books

-- Create the database
CREATE DATABASE IF NOT EXISTS berties_books;
USE berties_books;

-- Create the tables
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(8,2) NOT NULL DEFAULT 0.00
);

-- users table (used by routes/users.js)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    first VARCHAR(100),
    last VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    hashedPassword VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- audit_log table (used by recordAudit in routes/users.js)
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    success TINYINT(1) NOT NULL,
    reason TEXT,
    ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create application user and grant privileges
CREATE USER IF NOT EXISTS 'berties_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON berties_books.* TO 'berties_user'@'localhost';
FLUSH PRIVILEGES;
