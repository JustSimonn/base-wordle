// /components/leaderboard-table.tsx
import React from "react"

export interface LeaderboardEntry {
  rank: number
  walletAddress: string
  totalPoints: number
  totalGames: number
  username?: string
}

interface LeaderboardTableProps {
  players: LeaderboardEntry[]
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ players }) => {
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Rank</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Player</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Score</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Games</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.walletAddress + "-" + player.rank}
              className={`border-b border-border transition-colors ${
                index % 2 === 0 ? "bg-card/50" : "bg-card"
              } hover:bg-primary/5`}
            >
              {/* Rank */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      player.rank === 1
                        ? "bg-yellow-500 text-white"
                        : player.rank === 2
                        ? "bg-gray-400 text-white"
                        : player.rank === 3
                        ? "bg-orange-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {player.rank}
                  </div>
                </div>
              </td>

              {/* Player */}
              <td className="px-4 py-4 font-medium text-foreground">
                {player.username || formatAddress(player.walletAddress)}
              </td>

              {/* Score */}
              <td className="px-4 py-4 text-center font-semibold text-foreground">
                {player.totalPoints}
              </td>

              {/* Games */}
              <td className="px-4 py-4 text-center text-foreground">
                {player.totalGames}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}