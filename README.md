# Base Wordle - Full-Stack Crypto Wordle Game

A complete full-stack Wordle game built on the Base blockchain, designed to run as a Farcaster mini app. Players connect their wallets, deposit ETH for gas, and compete on a leaderboard while earning rewards.

## Features

- **Wallet Connection**: Connect Base chain wallets (MetaMask, Coinbase Wallet, etc.)
- **Gas-Powered Gameplay**: Players deposit $0.50-$1 ETH to cover gas fees for guesses
- **Developer Fees**: 25% of gas used is collected as developer fee (capped at $0.03)
- **Daily Streaks**: Track consecutive daily wins with streak counter
- **Leaderboard**: Real-time rankings by points and current streak
- **Player Stats**: Display wins, total games, streaks, and earnings
- **Crypto-Themed Words**: 40+ crypto-related 5-letter words for daily challenges
- **Responsive Design**: Mobile-optimized for Farcaster mini apps

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **ethers.js** - Blockchain interaction
- **shadcn/ui** - Component library

### Backend
- **Next.js API Routes** - Serverless backend
- **PostgreSQL** - Database (via Supabase or Neon)
- **pg** - PostgreSQL client

### Blockchain
- **Base Chain** - Layer 2 Ethereum
- **ethers.js** - Web3 library

## Project Structure

\`\`\`
base-wordle/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── game/              # Game logic endpoints
│   │   ├── leaderboard/       # Leaderboard endpoints
│   │   └── user/              # User stats endpoints
│   ├── game/                  # Game page
│   ├── leaderboard/           # Leaderboard page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── game/                  # Game-specific components
│   │   ├── wordle-game.tsx
│   │   ├── wordle-grid.tsx
│   │   ├── game-keyboard.tsx
│   │   ├── player-stats.tsx
│   │   ├── deposit-prompt.tsx
│   │   ├── balance-display.tsx
│   │   └── gas-tracker.tsx
│   ├── ui/                    # shadcn/ui components
│   ├── navigation.tsx         # Navigation header
│   ├── footer.tsx             # Footer
│   ├── leaderboard-table.tsx  # Leaderboard table
│   └── wallet-button.tsx      # Wallet connection button
├── database/
│   ├── schema.sql             # Database schema
│   └── types.ts               # TypeScript types
├── hooks/
│   ├── use-game.ts            # Game logic hook
│   ├── use-leaderboard.ts     # Leaderboard hook
│   └── use-user-stats.ts      # User stats hook
├── lib/
│   ├── config.ts              # Configuration
│   ├── db.ts                  # Database utilities
│   ├── wallet-context.tsx     # Wallet context provider
│   ├── wallet-utils.ts        # Wallet utilities
│   ├── gas-utils.ts           # Gas calculation utilities
│   └── word-list.ts           # Crypto word list
└── public/                    # Static assets
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (Supabase or Neon)
- MetaMask or compatible Web3 wallet

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd base-wordle
npm install
\`\`\`

### 2. Database Setup

Create a PostgreSQL database and run the schema:

\`\`\`bash
# Using psql
psql -U postgres -d your_database < database/schema.sql

# Or copy the SQL from database/schema.sql and run in your database UI
\`\`\`

### 3. Environment Variables

Create a `.env.local` file:

\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/base_wordle

# Base Chain RPC
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org

# Optional: For production
NODE_ENV=production
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the app.

## API Endpoints

### Authentication
- `POST /api/auth/connect` - Connect wallet and create/get user
- `POST /api/auth/balance` - Update user ETH balance

### Game
- `GET /api/game/word` - Get word of the day info
- `POST /api/game/word` - Validate guess and get feedback
- `POST /api/game/score` - Save game score and update streaks
- `GET /api/game/gas-estimate` - Estimate gas for a guess
- `POST /api/game/deposit` - Record ETH deposit

### Leaderboard
- `GET /api/leaderboard?limit=10` - Get top players

### User
- `GET /api/user/stats?address=0x...` - Get user stats and streaks

## Database Schema

### Users Table
- `id` - Primary key
- `wallet_address` - Unique wallet address
- `username` - Optional display name
- `eth_balance` - Current ETH balance
- `total_points` - Cumulative points
- `created_at` - Account creation timestamp

### Scores Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `game_date` - Date of game
- `points_earned` - Points from this game
- `word_guessed` - The word guessed
- `attempts` - Number of attempts
- `gas_used` - Gas consumed
- `developer_fee` - Fee collected

### Streaks Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `current_streak` - Current consecutive wins
- `longest_streak` - Best streak ever
- `last_played_date` - Last game date

## Game Logic

### Scoring
- Base points: 10 per win
- Bonus multiplier: (6 - attempts) / 6
- Example: Win in 3 attempts = 10 * (6-3)/6 = 5 points

### Streaks
- Increments on daily win
- Resets if player doesn't play the next day
- Tracked separately from points

### Gas Fees
- Each guess costs ~50,000 gas
- Developer fee: 25% of gas cost (capped at $0.03)
- Player pays full gas cost
- Unused balance stays in wallet

## Wallet Integration

### Supported Wallets
- MetaMask
- Coinbase Wallet
- WalletConnect
- Other EIP-1193 compatible wallets

### Network Configuration
- Chain ID: 8453 (Base)
- RPC: https://mainnet.base.org
- Currency: ETH

## Smart Contract Integration (TODO)

The following smart contract functions need to be implemented:

```solidity
// Deposit ETH for gas
function deposit() external payable

// Withdraw unused balance
function withdraw(uint256 amount) external

// Record game result and collect fees
function recordGameResult(
  address player,
  uint256 points,
  uint256 gasUsed
) external

// Distribute rewards to top players
function distributeWeeklyRewards() external
