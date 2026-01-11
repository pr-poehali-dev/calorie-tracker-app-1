-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы профилей пользователей (данные для расчета КБЖУ)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  gender VARCHAR(10) NOT NULL,
  age INTEGER NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  activity_level DECIMAL(3,2) NOT NULL,
  daily_calories INTEGER,
  daily_protein INTEGER,
  daily_fats INTEGER,
  daily_carbs INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Создание таблицы записей питания
CREATE TABLE IF NOT EXISTS meal_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  food_name VARCHAR(255) NOT NULL,
  food_category VARCHAR(100),
  grams DECIMAL(7,2) NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(6,2) NOT NULL,
  fats DECIMAL(6,2) NOT NULL,
  carbs DECIMAL(6,2) NOT NULL,
  meal_date DATE NOT NULL,
  meal_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_meal_entries_user_date ON meal_entries(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
