-- Executed by root user
-- @block
CREATE USER 'mysql'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES, RELOAD on *.* TO 'mysql'@'localhost' WITH GRANT OPTION;

--Executed by mysql user

-- @block
CREATE DATABASE flute;

-- Blok-blok di bawah sebaiknya dieksekusi menggunakan SQLTools (Ekstensi VSCode) untuk memudahkan
-- Buat koneksi terlebih dahulu menggunakan SQLTools ke database flute
-- @block
CREATE TABLE Messages(
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255),
    timestamp datetime DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

-- @block
CREATE TABLE Users(
    username VARCHAR(255) PRIMARY KEY,
    password BINARY(60)
);

-- To delete table
-- @block 
DROP TABLE Messages;
-- @block 
DROP TABLE Users;

-- For testing
-- @block
INSERT INTO Messages(username, message)
VALUES('Rizki','pesan dari Rizki');

-- @block
INSERT INTO Users(username, password)
VALUES('Gala', '$2b$10$oGcMZH9j5mu1Qi20DOi2ZuRDzboLtiXZyFFpD79y7ksEu93aL25li');

-- @block
SELECT * FROM Messages;

-- @block
SELECT password FROM Users WHERE username = 'Rizki';

-- @block
SELECT COUNT(1) FROM Users WHERE username = "Gala";