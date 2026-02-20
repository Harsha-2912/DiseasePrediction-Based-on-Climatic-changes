CREATE DATABASE IF NOT EXISTS climate_disease_db;
USE climate_disease_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    temperature FLOAT,
    humidity FLOAT,
    rainfall FLOAT,
    aqi FLOAT,
    location VARCHAR(255),
    predicted_disease VARCHAR(255),
    accuracy FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS precautions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    precautions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some dummy precautions
INSERT INTO precautions (disease_name, description, precautions) VALUES
('Malaria', 'A mosquito-borne infectious disease.', '["Use mosquito nets", "Wear long sleeves", "Use insect repellent"]'),
('Dengue', 'A mosquito-borne viral disease.', '["Eliminate standing water", "Use mosquito repellent", "Wear protective clothing"]'),
('Typhoid', 'A bacterial infection aiming at intestines.', '["Drink clean water", "Eat cooked food", "Wash hands regularly"]'),
('Asthma', 'A condition in which your airways narrow and swell.', '["Avoid triggers", "Take medication", "Monitor breathing"]');
