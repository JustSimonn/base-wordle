-- Users table to store wallet information and player data
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100),
  eth_balance DECIMAL(18, 8) DEFAULT 0,
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table to track daily game results
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  points_earned INT DEFAULT 0,
  word_guessed VARCHAR(5),
  attempts INT,
  gas_used DECIMAL(18, 8),
  developer_fee DECIMAL(18, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_date)
);

-- Streaks table to track consecutive daily wins
CREATE TABLE IF NOT EXISTS streaks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_played_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_scores_user_date ON scores(user_id, game_date);
CREATE INDEX idx_streaks_user ON streaks(user_id);
