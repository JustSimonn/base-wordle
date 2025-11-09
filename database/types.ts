// TypeScript types for database models
export interface User {
  id: number
  wallet_address: string
  username?: string
  eth_balance: string
  total_points: number
  created_at: Date
  updated_at: Date
}

export interface Score {
  id: number
  user_id: number
  game_date: string
  points_earned: number
  word_guessed?: string
  attempts: number
  gas_used: string
  developer_fee: string
  created_at: Date
}

export interface Streak {
  id: number
  user_id: number
  current_streak: number
  longest_streak: number
  last_played_date?: string
  updated_at: Date
}

export interface GameState {
  word: string
  attempts: number
  guesses: string[]
  gameStatus: "playing" | "won" | "lost"
  points: number
}
